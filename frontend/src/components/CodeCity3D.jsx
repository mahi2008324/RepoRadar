import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Layers,
  FileCode,
  ArrowRight,
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';

export default function CodeCity3D({ repository, nodes: propNodes, edges: propEdges }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Camera & Interaction State
  const [rotation, setRotation] = useState({ yaw: 45, pitch: 35 });
  const [zoom, setZoom] = useState(1.1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const nodes = useMemo(() => {
    if (Array.isArray(propNodes) && propNodes.length > 0) return propNodes;
    if (Array.isArray(repository?.nodes) && repository.nodes.length > 0) return repository.nodes;
    if (Array.isArray(repository?.files) && repository.files.length > 0) {
      return repository.files.map(f => {
        const path = typeof f === 'string' ? f : (f.path || f.name || String(f));
        return { id: path, path, label: path.split('/').pop() };
      });
    }
    return [];
  }, [propNodes, repository]);

  const edges = useMemo(() => {
    if (Array.isArray(propEdges) && propEdges.length > 0) return propEdges;
    if (Array.isArray(repository?.edges)) return repository.edges;
    return [];
  }, [propEdges, repository]);

  // 1. Process Nodes into City Districts & 3D Building Coordinates
  const cityLayout = useMemo(() => {
    if (!nodes.length) return { buildings: [], districts: [] };

    // Group by directory
    const districtGroups = new Map();
    nodes.forEach(node => {
      const path = node.path || node.label || node.id;
      const parts = path.split('/');
      const district = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
      if (!districtGroups.has(district)) {
        districtGroups.set(district, []);
      }
      districtGroups.get(district).push(node);
    });

    const buildings = [];
    const districts = [];
    let districtIndex = 0;
    const numDistricts = districtGroups.size;
    const gridCols = Math.ceil(Math.sqrt(numDistricts));
    const districtSpacing = 280;

    districtGroups.forEach((groupNodes, districtName) => {
      const dCol = districtIndex % gridCols;
      const dRow = Math.floor(districtIndex / gridCols);
      const districtCenterX = (dCol - gridCols / 2) * districtSpacing;
      const districtCenterZ = (dRow - Math.ceil(numDistricts / gridCols) / 2) * districtSpacing;

      districts.push({
        name: districtName,
        x: districtCenterX,
        z: districtCenterZ,
        count: groupNodes.length
      });

      // Layout buildings inside this district
      const bCols = Math.ceil(Math.sqrt(groupNodes.length));
      const bSpacing = 42;

      groupNodes.forEach((node, bIdx) => {
        const bCol = bIdx % bCols;
        const bRow = Math.floor(bIdx / bCols);
        const bx = districtCenterX + (bCol - bCols / 2) * bSpacing;
        const bz = districtCenterZ + (bRow - Math.ceil(groupNodes.length / bCols) / 2) * bSpacing;

        // Calculate height based on LOC / complexity
        const loc = node.metrics?.linesOfCode || 40 + Math.floor((node.id.length * 7) % 180);
        const height = Math.max(25, Math.min(180, loc * 0.75));

        // Inbound / Outbound counts
        const inCount = edges.filter(e => e.target === node.id).length;
        const outCount = edges.filter(e => e.source === node.id).length;
        const isCycle = node.inCycle || false;

        let color = '#10b981'; // Emerald for healthy
        if (isCycle) color = '#f43f5e'; // Rose/Red for circular
        else if (inCount >= 4) color = '#f59e0b'; // Amber for high-coupling hub
        else if (outCount >= 4) color = '#06b6d4'; // Cyan for heavy consumer
        else color = '#6366f1'; // Indigo standard

        buildings.push({
          id: node.id,
          label: (node.path || node.label || node.id).split('/').pop(),
          path: node.path || node.label || node.id,
          district: districtName,
          x: bx,
          z: bz,
          width: 24,
          depth: 24,
          height,
          loc,
          inCount,
          outCount,
          isCycle,
          color,
          screenPoly: [] // Calculated in render loop for raycasting
        });
      });

      districtIndex++;
    });

    return { buildings, districts };
  }, [nodes, edges]);

  // 2. 3D Projection Math Helper
  const project3D = (x, y, z, yawDeg, pitchDeg, scale, cx, cy) => {
    const yawRad = (yawDeg * Math.PI) / 180;
    const pitchRad = (pitchDeg * Math.PI) / 180;

    // Yaw rotation (around Y axis)
    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;

    // Pitch rotation (around X axis)
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);
    const ry = y * cosP - rz * sinP;
    const depth = y * sinP + rz * cosP;

    // Orthographic/Isometric with slight perspective scale
    const screenX = cx + rx * scale;
    const screenY = cy - ry * scale;

    return { x: screenX, y: screenY, depth };
  };

  // 3. Render Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight || 550);
      const cx = width / 2;
      const cy = height / 2 + 50;

      // Dark futuristic gradient background
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.7);
      bgGrad.addColorStop(0, '#0c101d');
      bgGrad.addColorStop(1, '#05070d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle isometric ground grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 450;
      const gridStep = 45;

      for (let g = -gridSize; g <= gridSize; g += gridStep) {
        const p1 = project3D(g, 0, -gridSize, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const p2 = project3D(g, 0, gridSize, rotation.yaw, rotation.pitch, zoom, cx, cy);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project3D(-gridSize, 0, g, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const p4 = project3D(gridSize, 0, g, rotation.yaw, rotation.pitch, zoom, cx, cy);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // Draw District Base Platforms
      cityLayout.districts.forEach(d => {
        const dSize = 130;
        const pts = [
          project3D(d.x - dSize, -2, d.z - dSize, rotation.yaw, rotation.pitch, zoom, cx, cy),
          project3D(d.x + dSize, -2, d.z - dSize, rotation.yaw, rotation.pitch, zoom, cx, cy),
          project3D(d.x + dSize, -2, d.z + dSize, rotation.yaw, rotation.pitch, zoom, cx, cy),
          project3D(d.x - dSize, -2, d.z + dSize, rotation.yaw, rotation.pitch, zoom, cx, cy)
        ];
        ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // District Label
        const centerPt = project3D(d.x, -4, d.z + dSize + 15, rotation.yaw, rotation.pitch, zoom, cx, cy);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, centerPt.x, centerPt.y);
      });

      // Sort buildings back-to-front (Painter's algorithm) based on depth
      const sortedBuildings = [...cityLayout.buildings].map(b => {
        const center = project3D(b.x, b.height / 2, b.z, rotation.yaw, rotation.pitch, zoom, cx, cy);
        return { ...b, screenDepth: center.depth };
      });
      sortedBuildings.sort((a, b) => a.screenDepth - b.screenDepth);

      // Render 3D Buildings
      sortedBuildings.forEach(b => {
        const isHovered = hoveredBuilding?.id === b.id;
        const isSelected = selectedBuilding?.id === b.id;
        const hw = b.width / 2;
        const hd = b.depth / 2;

        // 8 Vertices of the 3D Cuboid
        const b0 = project3D(b.x - hw, 0, b.z - hd, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const b1 = project3D(b.x + hw, 0, b.z - hd, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const b2 = project3D(b.x + hw, 0, b.z + hd, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const b3 = project3D(b.x - hw, 0, b.z + hd, rotation.yaw, rotation.pitch, zoom, cx, cy);

        const t0 = project3D(b.x - hw, b.height, b.z - hd, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const t1 = project3D(b.x + hw, b.height, b.z - hd, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const t2 = project3D(b.x + hw, b.height, b.z + hd, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const t3 = project3D(b.x - hw, b.height, b.z + hd, rotation.yaw, rotation.pitch, zoom, cx, cy);

        // Store 2D polygon bounding points for raycasting mouse clicks
        b.screenPoly = [t0, t1, t2, t3, b2, b3];

        // Shading colors
        let topColor = b.color;
        let sideColor = 'rgba(15, 23, 42, 0.85)';
        let frontColor = 'rgba(30, 41, 59, 0.9)';

        if (isHovered || isSelected) {
          topColor = '#ffffff';
          sideColor = b.color;
          frontColor = b.color;
        }

        // Draw Front Face (t3, t2, b2, b3)
        ctx.fillStyle = frontColor;
        ctx.beginPath();
        ctx.moveTo(t3.x, t3.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        // Draw Side Face (t2, t1, b1, b2)
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(t2.x, t2.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Top Roof Face (t0, t1, t2, t3)
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();

        // Roof glowing neon dot
        if (isHovered || isSelected || b.isCycle) {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 15;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          const topCenter = project3D(b.x, b.height + 2, b.z, rotation.yaw, rotation.pitch, zoom, cx, cy);
          ctx.arc(topCenter.x, topCenter.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Laser Highways for Active / Selected Building
      const activeB = hoveredBuilding || selectedBuilding;
      if (activeB) {
        // Find connected buildings
        const connectedEdges = edges.filter(e => e.source === activeB.id || e.target === activeB.id);
        connectedEdges.forEach(e => {
          const isOutbound = e.source === activeB.id;
          const otherId = isOutbound ? e.target : e.source;
          const targetBuilding = cityLayout.buildings.find(b => b.id === otherId);

          if (targetBuilding) {
            const startPt = project3D(activeB.x, activeB.height, activeB.z, rotation.yaw, rotation.pitch, zoom, cx, cy);
            const endPt = project3D(targetBuilding.x, targetBuilding.height, targetBuilding.z, rotation.yaw, rotation.pitch, zoom, cx, cy);

            ctx.save();
            ctx.shadowColor = isOutbound ? '#06b6d4' : '#10b981';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = isOutbound ? 'rgba(6, 182, 212, 0.7)' : 'rgba(16, 185, 129, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);

            // Curved 3D arch laser
            const midX = (startPt.x + endPt.x) / 2;
            const midY = Math.min(startPt.y, endPt.y) - 30;

            ctx.beginPath();
            ctx.moveTo(startPt.x, startPt.y);
            ctx.quadraticCurveTo(midX, midY, endPt.x, endPt.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // Auto-rotation in turntable mode
      if (autoRotate && !isDraggingRef.current) {
        setRotation(prev => ({ ...prev, yaw: (prev.yaw + 0.25) % 360 }));
      }
    };

    render();
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [cityLayout, rotation, zoom, autoRotate, hoveredBuilding, selectedBuilding]);

  // Mouse drag camera orbit controls
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      setRotation(prev => ({
        yaw: (prev.yaw + deltaX * 0.5) % 360,
        pitch: Math.max(10, Math.min(75, prev.pitch + deltaY * 0.4))
      }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Raycasting hit test
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let hit = null;
      // Reverse check from closest depth
      for (let i = cityLayout.buildings.length - 1; i >= 0; i--) {
        const b = cityLayout.buildings[i];
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + 50;
        const topCenter = project3D(b.x, b.height, b.z, rotation.yaw, rotation.pitch, zoom, cx, cy);
        const dist = Math.hypot(topCenter.x - mouseX, topCenter.y - mouseY);

        if (dist < 20) {
          hit = b;
          break;
        }
      }
      setHoveredBuilding(hit);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredBuilding) {
      setSelectedBuilding(hoveredBuilding);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-radar-card border border-radar-border shadow-2xl flex flex-col select-none">
      {/* Top Floating Futuristic HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 p-2 px-3.5 rounded-xl bg-radar-card/85 backdrop-blur-md border border-radar-border pointer-events-auto shadow-lg">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-radar-text">3D Code City</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
            {cityLayout.buildings.length} Buildings • {cityLayout.districts.length} Districts
          </span>
        </div>

        {/* Camera & Turntable Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-radar-card/85 backdrop-blur-md border border-radar-border pointer-events-auto shadow-lg">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              autoRotate
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-radar-surface text-radar-textSubtle border-radar-border hover:text-radar-text'
            }`}
            title={autoRotate ? 'Pause Turntable Orbit' : 'Resume Auto Turntable'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
            className="p-1.5 rounded-lg bg-radar-surface text-radar-textSubtle hover:text-radar-text border border-radar-border"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
            className="p-1.5 rounded-lg bg-radar-surface text-radar-textSubtle hover:text-radar-text border border-radar-border"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setRotation({ yaw: 45, pitch: 35 });
              setZoom(1.1);
            }}
            className="p-1.5 rounded-lg bg-radar-surface text-radar-textSubtle hover:text-radar-text border border-radar-border"
            title="Reset Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating Building Inspector HUD */}
      {(hoveredBuilding || selectedBuilding) && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 p-4 rounded-xl bg-radar-card/95 backdrop-blur-md border border-indigo-500/40 shadow-2xl animate-fade-in text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
              District: {(hoveredBuilding || selectedBuilding).district}
            </span>
            {(hoveredBuilding || selectedBuilding).isCycle && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-bold">
                ⚠️ Circular Cycle
              </span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <FileCode className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-radar-text font-mono truncate">
                {(hoveredBuilding || selectedBuilding).label}
              </h4>
              <p className="text-[11px] text-radar-textSubtle font-mono truncate">
                {(hoveredBuilding || selectedBuilding).path}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-2 bg-radar-surface/80 rounded-lg border border-radar-border/60 text-center font-mono">
            <div>
              <span className="text-[10px] text-radar-textSubtle block">Height</span>
              <span className="text-slate-200 font-bold">{(hoveredBuilding || selectedBuilding).loc} LOC</span>
            </div>
            <div>
              <span className="text-[10px] text-radar-textSubtle block">Dependents</span>
              <span className="text-emerald-400 font-bold">{(hoveredBuilding || selectedBuilding).inCount} in</span>
            </div>
            <div>
              <span className="text-[10px] text-radar-textSubtle block">Imports</span>
              <span className="text-cyan-400 font-bold">{(hoveredBuilding || selectedBuilding).outCount} out</span>
            </div>
          </div>

          <button
            onClick={() => {
              const b = hoveredBuilding || selectedBuilding;
              navigate(`/repositories/${repository.id}/explorer?file=${encodeURIComponent(b.path)}`);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors text-xs"
          >
            <span>Jump to Source Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Helper Legend Overlay in bottom-left */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-3 p-2 px-3 rounded-xl bg-radar-card/80 backdrop-blur-md border border-radar-border/60 text-[11px] text-radar-textSubtle pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Clean
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> High Coupling
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Cycle
        </span>
        <span className="text-[10px] opacity-75">| Drag to Orbit • Scroll to Zoom</span>
      </div>
    </div>
  );
}

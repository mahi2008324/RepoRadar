/**
 * Repository service connecting UI actions to backend endpoints
 */
import { api } from './api';

export const repositoryService = {
  /**
   * Submit repository URL for AST analysis
   */
  async analyze(url) {
    return api.post('/repositories/analyze', { url });
  },

  /**
   * Get all persisted repository analyses
   */
  async list(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/repositories${query}`);
  },

  /**
   * Get repository overview and metadata
   */
  async getDetails(id) {
    return api.get(`/repositories/${id}`);
  },

  /**
   * Get analyzed file tree
   */
  async getFiles(id) {
    return api.get(`/repositories/${id}/files`);
  },

  /**
   * Get file source code
   */
  async getFileContent(id, filePath) {
    return api.get(`/repositories/${id}/files/content?path=${encodeURIComponent(filePath)}`);
  },

  /**
   * Get React Flow graph nodes and edges
   */
  async getGraph(id) {
    return api.get(`/repositories/${id}/graph`);
  },

  /**
   * Get dependency analysis (cycles, most imported/dependent, disconnected)
   */
  async getAnalysis(id) {
    return api.get(`/repositories/${id}/analysis`);
  },

  /**
   * Get dependency impact analysis for a specific file
   */
  async getImpact(id, filePath) {
    return api.get(`/repositories/${id}/impact?file=${encodeURIComponent(filePath)}`);
  },

  /**
   * Reanalyze repository
   */
  async reanalyze(id) {
    return api.post(`/repositories/${id}/reanalyze`, {});
  },

  /**
   * Delete repository analysis record
   */
  async delete(id) {
    return api.delete(`/repositories/${id}`);
  }
};

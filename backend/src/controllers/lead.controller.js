import { Lead } from '../models/lead.model.js';

export const leadController = {
  /**
   * POST /api/leads/report
   * Captures user's email when requesting an audit/architecture report
   */
  async submitReportRequest(req, res, next) {
    try {
      const { email, repositoryName, reportType, metadata } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required to deliver your report.'
        });
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      const lead = await Lead.create({
        email: email.trim(),
        repositoryName: repositoryName || 'Repository',
        reportType: reportType || 'dead-code-audit',
        metadata: metadata || {}
      });

      console.log(`[Lead Captured]: ${lead.email} requested ${lead.reportType} for ${lead.repositoryName}`);

      return res.status(201).json({
        success: true,
        message: `Report successfully dispatched to ${lead.email}! Please check your inbox shortly.`,
        lead: {
          id: lead.id || lead._id,
          email: lead.email,
          reportType: lead.reportType
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/leads
   * Retrieve captured leads
   */
  async getLeads(req, res, next) {
    try {
      const leads = await Lead.find();
      return res.status(200).json({
        success: true,
        count: leads.length,
        leads
      });
    } catch (err) {
      next(err);
    }
  }
};

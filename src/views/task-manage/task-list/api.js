import { request } from '@/utils'

export default {
  toggleRole: data => request.post('/auth/role/toggle', data),
  login: data => request.post('/auth/login', data, { needToken: false }),
  // 支持后端分页与查询参数
  getJobsList: params => request.get('/jobs/all_jobs', { params }),
  createJob: data => request.post('/jobs/create', data),
  startCurrentJob: data => request.post('/jobs/start_job', data),
  stopCurrentJob: data => request.post('/jobs/end_job', data),
  deleteJob: id => request.delete(`/jobs/${id}`),
  generateReport: data => request.post('/jobs/generate_report', data, { responseType: 'arraybuffer' }),
}

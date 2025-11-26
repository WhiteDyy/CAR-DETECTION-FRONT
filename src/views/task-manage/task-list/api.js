import { request } from '@/utils'

export default {
  toggleRole: data => request.post('/auth/role/toggle', data),
  login: data => request.post('/auth/login', data, { needToken: false }),
  getJobsList: () => request.get('/jobs/all_jobs'),
  startCurrentJob: data => request.post('/jobs/start_job', data),
  stopCurrentJob: data => request.post('/jobs/end_job', data),
}

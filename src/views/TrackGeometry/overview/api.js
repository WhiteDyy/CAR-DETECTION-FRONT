import { request } from '@/utils'

export default {
  stopCurrentJob: data => request.post('/jobs/end_job', data),
}
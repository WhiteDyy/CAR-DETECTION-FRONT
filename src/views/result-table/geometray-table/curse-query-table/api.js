import { request } from '@/utils'

export default {
    getCurveList: data => request.post('/curve/search', data),
    getJobsList: () => request.get('/jobs/all_jobs'),
}
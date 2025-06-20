import { request } from '@/utils'

export default {
    getSgData: data => request.post('/sg/search', data),
}
import { request } from '@/utils'

export default {
    getTqi: data => request.post('/tqi/search', data),
}
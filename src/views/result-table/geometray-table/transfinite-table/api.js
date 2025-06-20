import { request } from '@/utils'

export default {
    getTransfinite: data => request.post('/transfinite/search', data),
}
import { request } from '@/utils'

export default {
    getCondense: data => request.post('/condense/search', data),
}
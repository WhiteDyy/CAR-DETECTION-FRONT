import { request } from '@/utils'

export default {
    getCurseInspect: data => request.post('/curse_inspect/search', data),
}
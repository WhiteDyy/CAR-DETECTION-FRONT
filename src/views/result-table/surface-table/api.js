import { request } from '@/utils'

export default {
  getSurface: data => request.post('/surface/search', data),
}

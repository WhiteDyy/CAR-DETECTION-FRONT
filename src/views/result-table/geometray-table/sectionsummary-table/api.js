import { request } from '@/utils'

export default {
  getSectionSummary: data => request.post('/section_summary/search', data),
}

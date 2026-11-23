import { reportsApi } from '@/api/reports.api'

export async function downloadReportCsv(reportType = 'vehicles', params = {}) {
  const query = { ...params, type: reportType }
  const res = await reportsApi.exportCsv(query)
  const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `transitops-${reportType}-report.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const downloadVehicleReportCsv = (params = {}) => downloadReportCsv('vehicles', params)

import { useEffect } from 'react'
import { init, dispose } from 'klinecharts'
import './App.css'



function App() {
  useEffect(() => {
    // initialize the chart
    const chart = init('chart')
    if(!chart) return
    setInterval(() => {
      getChartQuery()
      .then(mapData)
      .then((result) => {
        chart.applyNewData(result)
        chart.createIndicator('MA', false, { id: 'candle_pane' })
      })
    }, 2000)

    return () => {
      dispose('chart')
    }
  }, [])
  return (
    <div id='container'>
      <div id="chart" style={{ width: 1200, height: 600 }}/>
    </div>
  )
}

const getChartQuery = async () => {
  const res = await fetch('https://api.binance.com/api/v3/klines?symbol=1000SATSUSDT&interval=30m&limit=200')
  const result = await res.json()
  return result
}

function mapData(data:any){
  return data.map((item:any) => {
    const open = +item[1] * 10000000
    const high = +item[2] * 10000000
    const low = +item[3]* 10000000
    const close = +item[4]* 10000000
    const volume = +item[5]* 10000000
    const timestamp = +item[0]
    const res = {
      open,
      high,
      low,
      close,
      volume,
      turnover: (open + high + low + close) / 4 * volume,
      timestamp: timestamp
    }
    return res
  })
}

export default App

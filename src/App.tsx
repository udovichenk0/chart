import { useEffect } from 'react'
import { init, dispose, registerIndicator } from 'klinecharts'
import './App.css'

function App() {
  useEffect(() => {
    // initialize the chart

    const chart = init('chart')
    const values = [
      {
        time: 1713857400000,
        value: 3500
      }, {
        time: 1713859200000,
        value: 3550
      }
    ]
    if(!chart) return
    indicator(values)
    // setInterval(() => {
      getChartQuery()
      .then(mapData)
      .then((result) => {
        chart.applyNewData(result)
        // chart.createOverlay("priceLine")
        chart.createIndicator('Custom', false, { id: 'candle_pane' })
        // chart
      })
    // }, 2000)

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

function indicator(values: any){
  registerIndicator({
  name: 'Custom',
  calc: (kLineDataList) => {
    return kLineDataList.map(kLineData => ({ close: kLineData.close,open:kLineData.open, time: kLineData.timestamp, values }))
  },
  draw: ({
    ctx,
    barSpace,
    visibleRange,
    indicator,
    xAxis,
    yAxis
  }) => {
    const { from, to } = visibleRange

    ctx.font = barSpace.gapBar + 'px' + ' Helvetica Neue'
    ctx.textAlign = 'center'
    const result = indicator.result
    ctx.setLineDash([]);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#874CCC"
    ctx.lineWidth = 5;
    let isInited = false
    for (let i = from; i < to; i++) {
      const data = result[i]
      for(let k = 0; k < data.values.length; k++){
        if(data.time == data.values[k].time){
          const x = xAxis.convertToPixel(i)
          const y = yAxis.convertToPixel(data.close)
          if(!isInited){
            isInited = true
            ctx.moveTo(x,y)
          }
          ctx.lineTo(x,y)
          break
        }
      }

    }
    ctx.stroke()
    return false
  }
})
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

import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [plot, setPlot] = useState<any>()
  const [isInitted, init] = useState(false)
  const [firstLine, setFirstLine] = useState<any[]>()
  const [secondLine, setSecondLine] = useState<any[]>()
  const [thirdLine, setThirdLine] = useState<any[]>()

  useEffect(() => {
      //@ts-ignore
    const table = anychart.data.table();
      //@ts-ignore
    const chart = anychart.stock();
    chart.tooltip(false);
    const plot = chart.plot(0);
    let chartData
    if(!isInitted){
    getChartQuery()
      .then(mapData).then((data) => {
        chartData = table.addData(data);
        //@ts-ignore
        setPlot(plot)
        
        const mapping2 = table.mapAs();
        mapping2.addField('open', 1);
        mapping2.addField('high', 2);
        mapping2.addField('low', 3);
        mapping2.addField('close', 4);
        var series = chart.plot(0).candlestick(mapping2);
        series.name("ACME Corp. stock prices");
        chart.container('container');
        chart.draw();
        init(true)
      }).then(() => {
        // set up websocket connection to get data in real time

        /**
         * const ws = new Websocket()
         * ws.addEventListener("message", (event) => {
         *  chartData.addData(event.data)
         * })
         */
      })
    }
  }, [])
  useEffect(() => {
    const interval = setInterval(() => {
      drawLine(plot, firstLine, setFirstLine, "red")
      drawLine(plot, secondLine, setSecondLine, "green")
      drawLine(plot, thirdLine, setThirdLine, "blue")
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [firstLine, plot])
  return (
    <div id="container" style={{width: "100%", height: "400px"}}></div>
  )
}

const getChartQuery = async () => {
  const res = await fetch('https://api.binance.com/api/v3/klines?symbol=1000SATSUSDT&interval=30m&limit=100')
  const result = await res.json()
  return result
}

function mapData(data:any){
  return data.map((item:any) => {
    const open = +item[1]
    const high = +item[2]
    const low = +item[3]
    const close = +item[4]
    const timestamp = +item[0]
    return [timestamp, open, high, low, close]
  })
}
export default App

function drawLine(plot:any, line: any, setLine:any, color: string){
  if(!plot) return
  if(!line){
    const lineData1 = [
      [Date.UTC(2024, 3, 25, 9, 30, 0), 0.0003],
      [Date.UTC(2024, 3, 25, 10, 0, 0), 0.0003],
    ]
    plot.line(lineData1).stroke(color)
    setLine([lineData1])
  } else {
    const timestamp = line[line.length - 1][1][0]
    const value = line[line.length - 1][1][1]
    var date = new Date(timestamp);
    
    date.setMinutes(date.getMinutes() + 30);
    var updatedTimestamp = date.getTime();
    const newValue = (Math.random() * 0.00001) + 0.0003

    const newLine = [[timestamp, value], [updatedTimestamp, newValue]]
    plot.line(newLine).stroke(color);
    setLine([...line, newLine])
  }
}
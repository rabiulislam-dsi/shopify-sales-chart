import React from "react";
import { 
    LineChart, Line, CartesianGrid,
    XAxis, YAxis, Tooltip,
    Legend, PieChart, Pie,
    Cell, RadialBarChart, RadialBar 
} from 'recharts';
import {lineColors,pieColors} from '../utils/colors';

const OrdersLineChart = (props) =>{
    const {lineChartData,productTypes} = props;
    if(lineChartData.length==0){
        return (
            <div style={{margin:10}}>No Data Found</div>
        );
    }
    const Lines = productTypes.map((elm,idx)=>(           
        <Line
        key={elm.node+idx}
        name={elm.node}
        type="monotone"
        dataKey={elm.node}
        stroke={lineColors[idx]}
        strokeWidth={2}
        />
    ));
    return (
        <LineChart width={950} height={250} data={lineChartData}
        margin={{ top: 25, right: 20, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Lines}
        </LineChart>
    );
}

const OrdersPieChart= (props) =>{
    const {pieChartData}=props;
    if(pieChartData.length==0){
        return (
            <div style={{margin:20}}>No Data Found</div>
        );
    }
    return (
        <PieChart width={450} height={250}>
            <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} label>
            {
                pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index]}/>
                ))
            }
            </Pie>
            <Legend />
        </PieChart>
    );
}

const OrdersBarChart= (props) =>{
    const {countryBarChartData}=props;
    if(countryBarChartData.length==0){
        return (
            <div style={{margin:20}}>No Data Found</div>
        );
    }
    return (
        <RadialBarChart 
            width={450} 
            height={250} 
            innerRadius="10%" 
            outerRadius="80%" 
            data={countryBarChartData} 
            startAngle={180}
            endAngle={0}
        >
            <RadialBar minAngle={15} label={{ fill: '#ffffff', position: 'insideStart' }} background clockWise={true} dataKey='productQuantity' />
            <Legend iconSize={10} width={120} height={140} layout='horizontal' verticalAlign='middle' align="right" />
            <Tooltip />
        </RadialBarChart>
    );
}

export { OrdersLineChart,OrdersPieChart,OrdersBarChart };
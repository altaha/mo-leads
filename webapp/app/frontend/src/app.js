import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import {TagCloud} from 'react-tagcloud'

import Graph from './GraphVis'


export class App extends React.Component {
    render() {
        const cloudData = [
            { value: "Spark Streaming", count: 38 },
            { value: "React", count: 30 },
            { value: "Flask", count: 28 },
            { value: "Cassandra", count: 25 },
            { value: "JavaScript ES6", count: 33 },
            { value: "ElasticSearch", count: 18 },
            { value: "Kafka", count: 20 }
        ]

        const graphData = {
            nodes: [
                {id: 1, label: 'Node 1'},
                {id: 2, label: 'Node 2'},
                {id: 3, label: 'Node 3'},
                {id: 4, label: 'Node 4'},
                {id: 5, label: 'Node 5'}
            ],
            edges: [
                {from: 1, to: 2},
                {from: 1, to: 3},
                {from: 2, to: 4},
                {from: 2, to: 5}
            ]
        }

        return (
            <div className='app-container'>
                <h1>
                    Mo leads
                </h1>
                <div style={{width: 300}}>
                    <TagCloud
                        minSize={12}
                        maxSize={35}
                        tags={cloudData}
                        onClick={tag => console.log('clicking on tag:', tag)}
                    />
                </div>
                <Graph graph={graphData}/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector("#myApp"))

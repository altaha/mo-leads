import Immutable from 'immutable'
import React from 'react'

import {Card, CardHeader, CardMedia} from 'material-ui/Card'
import Graph from './GraphVis'


class PaymentsGraph extends React.Component {
    static propTypes = {
        adjacencyList: React.PropTypes.object.isRequired,
        showGraph: React.PropTypes.bool.isRequired,
        toggleShowGraph: React.PropTypes.func.isRequired
    }

    render() {
        const adjacencyList = this.props.adjacencyList.map((payment) => {
            return {
                actorId: payment.get('actor_id'),
                actorName: payment.get('actor_name'),
                targetId: payment.get('target_id'),
                targetName: payment.get('target_name'),
                id: payment.get('id')
            }
        })
        if (adjacencyList.isEmpty()) {
            return null
        }

        const graphEdges = adjacencyList.map((payment) => {
            return {id: payment.id, from: payment.actorId, to: payment.targetId}
        })

        const graphNodes = adjacencyList.flatMap((payment) => {
            return new Immutable.fromJS([
                {id: payment.actorId, label: payment.actorName},
                {id: payment.targetId, label: payment.targetName}
            ])
        }).toSet()

        const graphData = {
            nodes: graphNodes.toJS(),
            edges: graphEdges.toArray()
        }

        return (
            <Card
                expanded={this.props.showGraph}
                onExpandChange={this.props.toggleShowGraph}
            >
                <CardHeader
                    actAsExpander={true}
                    showExpandableButton={true}
                    title="Connections Graph"
                />
                <CardMedia expandable={true} >
                    <Graph graph={graphData} />
                </CardMedia>
            </Card>
        )
    }
}

export default PaymentsGraph

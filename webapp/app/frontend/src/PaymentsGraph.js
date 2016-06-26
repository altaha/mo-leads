import Immutable from 'immutable'
import React from 'react'
import {shouldComponentUpdate} from 'react-immutable-render-mixin'

import {Card, CardHeader, CardMedia} from 'material-ui/Card'
import Graph from './GraphVis'
import Snackbar from 'material-ui/Snackbar'


class PaymentsGraph extends React.Component {
    static propTypes = {
        adjacencyList: React.PropTypes.object.isRequired,
        rootUserId: React.PropTypes.string.isRequired,
        showGraph: React.PropTypes.bool.isRequired,
        toggleShowGraph: React.PropTypes.func.isRequired
    }

    state = {
        edgeInfo: '',
        showEdgeInfo: false
    }

    shouldComponentUpdate = shouldComponentUpdate

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

        let graphNodes = adjacencyList.flatMap((payment) => {
            return new Immutable.fromJS([
                {id: payment.actorId, label: payment.actorName},
                {id: payment.targetId, label: payment.targetName}
            ])
        }).toSet()

        if (this.props.rootUserId !== '') {
            graphNodes = this.getGroupedNodes(graphNodes, graphEdges)
        }

        const graphData = {
            nodes: graphNodes.toJS(),
            edges: graphEdges.toArray()
        }

        const graphCard = (
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
                    <Graph
                        graph={graphData}
                        onClickEdge={this.onClickEdge}
                    />
                </CardMedia>
            </Card>
        )

        return (
            <div>
                {graphCard}
                <Snackbar
                    open={this.state.showEdgeInfo}
                    message={this.state.edgeInfo}
                    autoHideDuration={3000}
                    onRequestClose={this.hideEdgeInfo}
                />
            </div>
        )
    }

    getGroupedNodes(graphNodes, graphEdges) {
        const nodeDegreeMap = graphEdges.reduce((degreeMap, edge) => {
            const nodeId = edge.to
            const currentNodeDegree = degreeMap.get(nodeId, 1000)

            let newNodeDegree
            if (edge.from === this.props.rootUserId) {
                newNodeDegree = 1
            } else {
                newNodeDegree = 2
            }

            return (newNodeDegree < currentNodeDegree) ?
                degreeMap.set(nodeId, newNodeDegree) : degreeMap
        }, new Immutable.Map({[this.props.rootUserId]: 0}))

        return graphNodes.map(node => {
            const nodeDegree = nodeDegreeMap.get(node.get('id'))
            let nodeGroup = ''
            if (nodeDegree === 0) {
                nodeGroup = 'rootNode'
            } else if (nodeDegree === 1) {
                nodeGroup = 'firstDegree'
            } else if (nodeDegree === 2) {
                nodeGroup = 'secondDegree'
            }
            return node.set('group', nodeGroup)
        })
    }

    onClickEdge = (edgeId) => {
        const payment = this.props.adjacencyList.find(
            edge => edge.get('id') === edgeId
        )
        const paymentInfo = `message: ${payment.get('message')}, time: ${payment.get('time')}`
        this.setState({
            edgeInfo: paymentInfo,
            showEdgeInfo: true
        })
    }

    hideEdgeInfo = () => {
        this.setState({showEdgeInfo: false})
    }
}

export default PaymentsGraph

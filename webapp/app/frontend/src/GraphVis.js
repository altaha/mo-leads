import React from 'react'
import {red300, purple300, lime300} from 'material-ui/styles/colors'

const vis = require('vis')
const uuid = require('uuid')


class Graph extends React.Component {

    static propTypes = {
        graph: React.PropTypes.object,
        identifier: React.PropTypes.string,
        onClickEdge: React.PropTypes.func,
        onClickNode: React.PropTypes.func,
        style: React.PropTypes.object
    }

    static defaultProps = {
        graph: {},
        identifier: uuid.v4(),
        onClickEdge: () => {},
        onClickNode: () => {},
        style: {width: '640px', height: '480px'}
    }

    state = {
        enablePhysics: false
    }

    componentDidMount() {
        this.updateGraph()
    }

    componentDidUpdate() {
        this.updateGraph()
    }

    changeMode = () => {
        const enablePhysics = !this.state.enablePhysics
        this.setState({enablePhysics})
    }

    updateGraph() {
        let container = document.getElementById(this.props.identifier)
        let options = {
            edges: {
                color: '#000000',
                width: 0.5,
                arrows: {
                    to: {scaleFactor: 0.5}
                }
            },
            groups: {
                rootNode: {color: {background: red300}},
                firstDegree: {color: {background: purple300}},
                secondDegree: {color: {background: lime300}}
            },
            interaction: {
                dragNodes: true
            },
            layout: {
                hierarchical: false
            },
            physics: {
                enabled: this.state.enablePhysics,
                stabilization: true
            }
        }

        this.network = new vis.Network(container, this.props.graph, options)
        this.network.on('select', function(params) {
            if (params.nodes.length > 0) {
                this.props.onClickNode(params.nodes[0])
            } else if (params.edges.length > 0) {
                this.props.onClickEdge(params.edges[0])
            }
        }.bind(this))
    }

    render() {
        return React.createElement(
            'div',
            {onDoubleClick: this.changeMode, id: this.props.identifier, style: this.props.style},
            this.props.identifier
        )
    }
}

export default Graph

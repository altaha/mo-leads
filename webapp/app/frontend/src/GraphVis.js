import React from 'react'

const vis = require('vis')
const uuid = require('uuid')


class Graph extends React.Component {

    static propTypes = {
        graph: React.PropTypes.object,
        identified: React.PropTypes.string,
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
        hierarchicalLayout: false
    }

    componentDidMount() {
        this.updateGraph()
    }

    componentDidUpdate() {
        this.updateGraph()
    }

    changeMode(event) {
        this.setState({
            hierarchicalLayout: !this.state.hierarchicalLayout
        })
        this.updateGraph()
    }

    updateGraph() {
        let container = document.getElementById(this.props.identifier)
        let options = {
            physics: {stabilization: true},
            edges: {
                color: '#000000',
                width: 0.5,
                arrows: {
                    to: {scaleFactor: 0.5}
                }
            }
        }

        if (this.state.hierarchicalLayout) {
            options.layout = {hierarchical: {
                enabled: true,
                direction: 'UD',
                levelSeparation: 100,
                nodeSpacing: 1
            }}
        } else {
            options.layout = {hierarchical: false}
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
            {onDoubleClick: this.changeMode.bind(this), id: this.props.identifier, style: this.props.style},
            this.props.identifier
        )
    }
}

export default Graph

import Immutable from 'immutable'
import React from 'react'

import PaymentsGraph from './PaymentsGraph'
import PaymentsWordCloud from './PaymentsWordCloud'
import UserInputController from './UserInputController'

const REST_API = {
    PAYMENTS_FOR_KEYWORD: (keyword) => `/api/payments/${keyword}`,
    ADJACENCY_LIST: (payerList) => `/api/adjacency/?root=${payerList}`
}


class MainController extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasQueryWord: false,
            queryWord: '',
            queryWordAdjacency: new Immutable.List(),
            queryWordPayments: new Immutable.List(),
            hasExpandedKeywords: false,
            expandedKeyWords: new Immutable.List(),
            queryWordGraph: new Immutable.Map(),
            expandedKeyWordsGraph: new Immutable.Map()
        }
    }

    render() {
        return (
            <div>
                <h1>Mo Leads App</h1>
                <UserInputController
                    onUpdateQueryWord={this.onUpdateQueryWord}
                />
                <PaymentsWordCloud
                    payments={this.state.queryWordPayments}
                />
                <PaymentsGraph
                    adjacencyList={this.state.queryWordAdjacency}
                />
            </div>
        )
    }

    onUpdateQueryWord = (queryWord) => {
        const hasQueryWord = queryWord === ''
        this.setState({
            hasQueryWord,
            queryWord,
            queryWordPayments: new Immutable.List(),
            queryWordAdjacency: new Immutable.List()
        }, this.fetchQueryWordPayments)
    }

    fetchQueryWordPayments = () => {
        fetch(
            REST_API.PAYMENTS_FOR_KEYWORD(this.state.queryWord)
        ).then((response) => {
            return response.json()
        }).then((paymentsJson) => {
            const payments = paymentsJson.payments.map(
                (payment) => payment._source
            )
            this.setState({
                queryWordPayments: Immutable.fromJS(payments)
            }, this.fetchPaymentsAdjacency)
        }).catch((ex) => {
            console.error('fetch failed', ex)
        })
    }

    fetchPaymentsAdjacency = () => {
        const payments = this.state.queryWordPayments
        const payerList = payments.map(
            payment => payment.getIn(['actor', 'id'])
        ).toSet().join(',')
        if (payerList === '') {
            return
        }

        fetch(
            REST_API.ADJACENCY_LIST(payerList)
        ).then((response) => {
            return response.json()
        }).then((adjacencyList) => {
            this.setState({
                queryWordAdjacency: Immutable.fromJS(adjacencyList)
            })
        }).catch((ex) => {
            console.error('fetch failed', ex)
        })
    }
}

export default MainController

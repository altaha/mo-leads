import Immutable from 'immutable'
import React from 'react'

import AppBar from 'material-ui/AppBar';
import PaymentsGraph from './PaymentsGraph'
import PaymentsWordCloud from './PaymentsWordCloud'
import TopUsersView from './TopUsersView'
import UserInputController from './UserInputController'


function dateRangeQueryParams(startDate, endDate) {
    const startDateParam = startDate !== '' ? `&t1=${startDate}` : ''
    const endDateParam = endDate !== '' ? `&t2=${endDate}` : ''
    return `${startDateParam}${endDateParam}`
}

const REST_API = {
    PAYMENTS_FOR_KEYWORD: (keyword, startDate, endDate) => {
        const dateRangeQuery = dateRangeQueryParams(startDate, endDate)
        return `/api/payments/${keyword}/?${dateRangeQuery}`
    },
    ADJACENCY_LIST: (payerList, startDate, endDate) => {
        const dateRangeQuery = dateRangeQueryParams(startDate, endDate)
        return `/api/adjacency/?root=${payerList}${dateRangeQuery}`
    }
}


class MainController extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasQueryWord: false,
            queryWord: '',
            queryWordAdjacency: new Immutable.List(),
            queryWordPayments: new Immutable.List(),
            queryWordTopUsers: new Immutable.List()
        }
    }

    render() {
        return (
            <div>
                <AppBar
                    title="Venmo Leads"
                    showMenuIconButton={false}
                />
                <UserInputController
                    onUpdateQueryWord={this.onUpdateQueryWord}
                />
                <PaymentsWordCloud
                    payments={this.state.queryWordPayments}
                />
                <TopUsersView
                    topUsers={this.state.queryWordTopUsers}
                />
                <PaymentsGraph
                    adjacencyList={this.state.queryWordAdjacency}
                />
            </div>
        )
    }

    onUpdateQueryWord = (queryWord, queryStartDate, queryEndDate) => {
        const hasQueryWord = queryWord === ''
        this.setState({
            hasQueryWord,
            queryWord,
            queryStartDate,
            queryEndDate,
            queryWordAdjacency: new Immutable.List(),
            queryWordPayments: new Immutable.List(),
            queryWordTopUsers: new Immutable.List()
        }, this.fetchQueryWordPayments)
    }

    fetchQueryWordPayments = () => {
        fetch(
            REST_API.PAYMENTS_FOR_KEYWORD(
                this.state.queryWord,
                this.state.queryStartDate,
                this.state.queryEndDate
            )
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
            payment => payment.get('actor_id')
        ).toSet().join(',')
        if (payerList === '') {
            return
        }

        fetch(
            REST_API.ADJACENCY_LIST(
                payerList,
                this.state.queryStartDate,
                this.state.queryEndDate
            )
        ).then((response) => {
            return response.json()
        }).then((adjacencyList) => {
            this.setState({
                queryWordAdjacency: Immutable.fromJS(adjacencyList)
            }, this.getQueryWordTopUsers)
        }).catch((ex) => {
            console.error('fetch failed', ex)
        })
    }

    getQueryWordTopUsers = () => {
        const adjacencyList = this.state.queryWordAdjacency
        if (adjacencyList.isEmpty()) {
            return
        }

        const topUsers = adjacencyList.countBy(
            entry => entry.get('actor_name')
        ).sort().reverse()
        this.setState({
            queryWordTopUsers: topUsers
        })
    }
}

export default MainController

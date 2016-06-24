import Immutable from 'immutable'
import React from 'react'

import AppBar from 'material-ui/AppBar'
import PaymentsGraph from './PaymentsGraph'
import TopUsersView from './TopUsersView'
import UserInputController from './UserInputController'
import WordCloudController from './WordCloudController'


function dateRangeQueryParams(startDate, endDate) {
    const startDateParam = startDate !== '' ? `&t1=${startDate}` : ''
    const endDateParam = endDate !== '' ? `&t2=${endDate}` : ''
    return `${startDateParam}${endDateParam}`
}

const REST_API = {
    ADJACENCY_LIST: (payerList, startDate, endDate) => {
        const dateRangeQuery = dateRangeQueryParams(startDate, endDate)
        return `/api/adjacency/?root=${payerList}${dateRangeQuery}`
    },
    LATEST_WORD_COUNT: () => `/api/word_count/latest/`,
    PAYMENTS_FOR_KEYWORD: (keyword, startDate, endDate) => {
        const dateRangeQuery = dateRangeQueryParams(startDate, endDate)
        return `/api/payments/${keyword}/?significant&${dateRangeQuery}`
    },
    USER_ADJACENCY_LIST: (userId, startDate, endDate) => {
        const dateRangeQuery = dateRangeQueryParams(startDate, endDate)
        return `/api/adjacency/${userId}/?${dateRangeQuery}`
    }
}


class MainController extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            latestWordCount: new Immutable.Map(),
            queryEndDate: '',
            queryStartDate: '',
            queryWord: '',
            queryWordAdjacency: new Immutable.List(),
            queryWordPayments: new Immutable.List(),
            queryWordTopUsers: new Immutable.List(),
            selectedUserAdjacency: new Immutable.List(),
            showGraph: false,
            significantTermsCount: new Immutable.Map()
        }
    }

    componentWillMount() {
        this.fetchLatestWordCount()
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    render() {
        const adjacencyList = this.state.selectedUserAdjacency.count() > 0 ?
            this.state.selectedUserAdjacency : this.state.queryWordAdjacency

        return (
            <div>
                <AppBar
                    title="Venmo Leads"
                    showMenuIconButton={false}
                />
                <UserInputController
                    onSubmitQuery={this.onSubmitQuery}
                    onUpdateQueryEndDate={this.onUpdateQueryEndDate}
                    onUpdateQueryStartDate={this.onUpdateQueryStartDate}
                    onUpdateQueryWord={this.onUpdateQueryWord}
                    queryEndDate={this.state.queryEndDate}
                    queryStartDate={this.state.queryStartDate}
                    queryWord={this.state.queryWord}
                />
                <WordCloudController
                    hasQueryWord={this.hasQueryWord()}
                    latestWordCount={this.state.latestWordCount}
                    onClickCloudWord={this.addQueryWord}
                    queryWord={this.state.queryWord}
                    significantWordCount={this.state.significantTermsCount}
                />
                <TopUsersView
                    onClickUser={this.onClickUser}
                    topUsers={this.state.queryWordTopUsers}
                />
                <PaymentsGraph
                    adjacencyList={adjacencyList}
                    showGraph={this.state.showGraph}
                    toggleShowGraph={this.toggleShowGraph}
                />
            </div>
        )
    }

    hasQueryWord() {
        return this.state.queryWord !== ''
    }

    fetchLatestWordCount = () => {
        if (!this.hasQueryWord()) {
            fetch(
                REST_API.LATEST_WORD_COUNT()
            ).then((response) => {
                return response.json()
            }).then((wordCounts) => {
                this.setState({
                    latestWordCount: new Immutable.Map(wordCounts)
                })
            }).catch((ex) => {
                console.error('fetch failed', ex)
            })
        }
        this.timer = setTimeout(this.fetchLatestWordCount, 4000)
    }

    onUpdateQueryWord = (queryWord) => {
        this.setState({queryWord}, this.onSubmitQuery)
    }

    onUpdateQueryStartDate = (queryStartDate) => {
        this.setState({queryStartDate}, this.onSubmitQuery)
    }

    onUpdateQueryEndDate = (queryEndDate) => {
        this.setState({queryEndDate}, this.onSubmitQuery)
    }

    onSubmitQuery = () => {
        this.setState({
            queryWordAdjacency: new Immutable.List(),
            queryWordPayments: new Immutable.List(),
            queryWordTopUsers: new Immutable.List(),
            selectedUserAdjacency: new Immutable.List(),
            showGraph: false,
            significantTermsCount: new Immutable.Map()
        }, this.fetchQueryWordPayments)
    }

    addQueryWord = (wordToAdd) => {
        if (this.state.queryWord.indexOf(wordToAdd) !== -1) {
            return
        }

        const newQueryWord = `${this.state.queryWord} ${wordToAdd}`
        this.setState({
            queryWord: newQueryWord
        }, this.onSubmitQuery)
    }

    fetchQueryWordPayments = () => {
        if (!this.hasQueryWord()) {
            return
        }
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

            const significantList = paymentsJson.significant
            if (!significantList ||!significantList.length) {
                return
            }
            const normalizer = significantList[significantList.length - 1].score
            const significantTerms = significantList.reduce((wordCount, entry) => {
                const word = entry.key
                const count = Math.round(entry.score / normalizer)
                return wordCount.set(word, count)
            }, new Immutable.Map())
            this.setState({
                significantTermsCount: significantTerms
            })
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

    toggleShowGraph = (showGraph) => {
        this.setState({showGraph})
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

    onClickUser = (userName) => {
        const user = this.state.queryWordAdjacency.find(
            userEntry => userEntry.get('actor_name') === userName
        )
        this.fetchUserAdjacency(user.get('actor_id'))
    }

    fetchUserAdjacency = (userId) => {
        fetch(
            REST_API.USER_ADJACENCY_LIST(
                userId,
                this.state.queryStartDate,
                this.state.queryEndDate
            )
        ).then((response) => {
            return response.json()
        }).then((adjacencyList) => {
            this.setState({
                selectedUserAdjacency: Immutable.fromJS(adjacencyList),
                showGraph: true
            })
        }).catch((ex) => {
            console.error('fetch failed', ex)
        })
    }
}

export default MainController

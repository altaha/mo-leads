import Immutable from 'immutable'
import React from 'react'
import {shouldComponentUpdate} from 'react-immutable-render-mixin'
import {TagCloud} from 'react-tagcloud'

import {Card, CardHeader, CardText} from 'material-ui/Card'


class WordCloudController extends React.Component {
    static propTypes = {
        hasQueryWord: React.PropTypes.bool,
        latestWordCount: React.PropTypes.object.isRequired,
        onClickCloudWord: React.PropTypes.func,
        queryWord: React.PropTypes.string.isRequired,
        queryWordPayments: React.PropTypes.object.isRequired,
        significantWordCount: React.PropTypes.object.isRequired
    }

    static defaultProps = {
        hasQueryWord: false,
        onClickCloudWord: () => {}
    }

    shouldComponentUpdate = shouldComponentUpdate

    render() {
        if (
            this.props.latestWordCount.isEmpty() &&
            this.props.significantWordCount.isEmpty()
       ) {
            return null
        }

        const headerTitle = this.getHeaderTitle()
        const wordCloud = this.getWordCloud()

        return (
            <Card initiallyExpanded={true} >
                <CardHeader
                    actAsExpander={true}
                    showExpandableButton={true}
                    title={headerTitle}
                />
                <CardText expandable={true} >
                    {wordCloud}
                </CardText>
            </Card>
        )
    }

    getHeaderTitle() {
        return this.props.hasQueryWord ?
            `Signifcant words related to "${this.props.queryWord}"` :
            'Word cloud from latest payments'
    }

    getWordCloud() {
        const cloudData = this.getCloudData()
        return (
            <TagCloud
                minSize={15}
                maxSize={50}
                tags={cloudData}
                onClick={this.onClickCloudTag}
            />
        )
    }

    getCloudData() {
        const cloudWordCount = this.getCloudWordCounts()
        return cloudWordCount.sort().reverse().map((count, token) => {
            return {value: token, count}
        }).valueSeq().take(100).toArray()
    }

    getCloudWordCounts() {
        if (!this.props.hasQueryWord) {
            return this.props.latestWordCount
        }

        const paymentsWordCount = this.props.queryWordPayments.flatMap(
            payment => {
                const message = payment.get('message')
                const tokens = message.toLowerCase().split(' ')
                return new Immutable.List(tokens)
            }).map(
                token => token.replace(/[^a-z]+/g, '')
            ).filter(
                token => token.length > 2
            ).filterNot(
                token => token === 'for' || token === "and" || token === "the" || token === "you"
            ).countBy(token => token)
        return this.props.significantWordCount.concat(paymentsWordCount)
    }

    onClickCloudTag = (tag) => {
        const word = tag.value
        this.props.onClickCloudWord(word)
    }
}

export default WordCloudController

import Immutable from 'immutable'
import React from 'react'
import {shouldComponentUpdate} from 'react-immutable-render-mixin'
import {TagCloud} from 'react-tagcloud'

import {Card, CardHeader, CardText} from 'material-ui/Card'


class PaymentsWordCloud extends React.Component {
    static propTypes = {
        onClickCloudWord: React.PropTypes.func,
        payments: React.PropTypes.object.isRequired,
        queryWord: React.PropTypes.string.isRequired,
        wordCount: React.PropTypes.object.isRequired,
    }

    static defaultProps = {
        onClickCloudWord: () => {}
    }

    shouldComponentUpdate = shouldComponentUpdate

    render() {
        const cloudData = this.getCloudData()
        if (cloudData.length == 0) {
            return null
        }

        const headerTitle = this.props.queryWord === '' ?
            'Word cloud for latest payments' :
            `Word cloud for payments related to "${this.props.queryWord}"`

        return (
            <Card initiallyExpanded={true} >
                <CardHeader
                    actAsExpander={true}
                    showExpandableButton={true}
                    title={headerTitle}
                />
                <CardText expandable={true} >
                    <TagCloud
                        minSize={12}
                        maxSize={35}
                        tags={cloudData}
                        onClick={this.onClickCloudTag}
                    />
                </CardText>
            </Card>
        )
    }

    getCloudData() {
        const cloudWordCount = this.props.queryWord === '' ? (
                this.props.wordCount.sort().reverse()
            ) : (
                this.props.payments.flatMap((payment) => {
                    const message = payment.get('message')
                    const tokens = message.toLowerCase().split(' ')
                    return new Immutable.List(tokens)
                }).countBy(token => token)
            )

        return cloudWordCount.map((count, token) => {
            return {value: token, count}
        }).valueSeq().take(100).toArray()
    }

    onClickCloudTag = (tag) => {
        const word = tag.value
        this.props.onClickCloudWord(word)
    }
}

export default PaymentsWordCloud

import Immutable from 'immutable'
import React from 'react'
import {TagCloud} from 'react-tagcloud'

import {Card, CardHeader, CardText} from 'material-ui/Card'


class PaymentsWordCloud extends React.Component {
    static propTypes = {
        payments: React.PropTypes.object.isRequired
    }

    render() {
        const payments = this.props.payments
        if (payments.isEmpty()) {
            return null
        }

        const cloudData = payments.flatMap((payment) => {
            const message = payment.get('message')
            const tokens = message.toLowerCase().split(' ')
            return new Immutable.List(tokens)
        }).countBy(token => token
        ).map((count, token) => {
            return {value: token, count}
        }).valueSeq().toArray()

        return (
            <Card initiallyExpanded={true} >
                <CardHeader
                    actAsExpander={true}
                    showExpandableButton={true}
                    title="Payments Word Cloud"
                />
                <CardText expandable={true} >
                    <TagCloud
                        minSize={12}
                        maxSize={35}
                        tags={cloudData}
                        onClick={tag => console.log('clicking on tag:', tag)}
                    />
                </CardText>
            </Card>
        )
    }
}

export default PaymentsWordCloud

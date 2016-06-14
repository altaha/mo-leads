import Immutable from 'immutable'
import React from 'react'
import {TagCloud} from 'react-tagcloud'


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
            <div style={{width: 300}}>
                <TagCloud
                    minSize={12}
                    maxSize={35}
                    tags={cloudData}
                    onClick={tag => console.log('clicking on tag:', tag)}
                />
            </div>
        )
    }
}

export default PaymentsWordCloud

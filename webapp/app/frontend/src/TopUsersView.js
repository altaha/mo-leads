import Immutable from 'immutable'
import React from 'react'

import {Card, CardHeader, CardText} from 'material-ui/Card'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'


class TopUsersView extends React.Component {
    static propTypes = {
        topUsers: React.PropTypes.object.isRequired
    }

    render() {
        if (this.props.topUsers.isEmpty()) {
            return null
        }

        const topUsersListItems = this.props.topUsers.map((count, user) => {
            return (
                <ListItem
                    key={user}
                    primaryText={user}
                    secondaryText={`${count} payments`}
                />
            )
        }).take(10).valueSeq()

        const topUsersList = (
            <List>
                {topUsersListItems}
            </List>
        )

        return (
            <Card initiallyExpanded={true} >
                <CardHeader
                    actAsExpander={true}
                    showExpandableButton={true}
                    title="Top Leads"
                />
                <CardText expandable={true} >
                    {topUsersList}
                </CardText>
            </Card>
        )
    }
}

export default TopUsersView

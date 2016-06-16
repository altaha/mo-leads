import Immutable from 'immutable'
import React from 'react'


class TopUsersView extends React.Component {
    static propTypes = {
        topUsers: React.PropTypes.object.isRequired
    }

    render() {
        if (this.props.topUsers.isEmpty()) {
            return null
        }

        const topUsersList = this.props.topUsers.map((count, user) => {
            const listItemText = `User: ${user}, ${count} times`
            return (
                <li key={user}>
                    {listItemText}
                </li>
            )
        }).valueSeq()
        return (
            <ol>
                {topUsersList}
            </ol>
        )
    }
}

export default TopUsersView

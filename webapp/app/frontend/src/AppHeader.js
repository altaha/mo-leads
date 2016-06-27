import React from 'react'

import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import {ToolbarGroup} from 'material-ui/Toolbar'


class AppHeader extends React.Component {
    render() {
        const links = (
            <ToolbarGroup style={{top: 4}} >
                <div>
                    <FlatButton
                        href="https://docs.google.com/presentation/d/1mEt0wHxxAHhKeoOYAQKSOyFO6DcdIaEN0Ne2UkKkAmg/edit?usp=sharing"
                        label="Slides"
                        linkButton={true}
                        target="_blank"
                    />
                    <FlatButton
                        href="https://github.com/altaha/mo-leads"
                        label="Github"
                        linkButton={true}
                        target="_blank"
                    />
                </div>
            </ToolbarGroup>
        )

        return (
            <AppBar
                title="Venmo Leads"
                showMenuIconButton={false}
				iconElementRight={links}
            />
        )
    }
}

export default AppHeader

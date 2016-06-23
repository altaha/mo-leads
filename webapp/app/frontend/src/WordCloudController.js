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
        const cloudWordCount = this.props.hasQueryWord ?
            this.props.significantWordCount : this.props.latestWordCount

        return cloudWordCount.sort().reverse().map((count, token) => {
            return {value: token, count}
        }).valueSeq().take(100).toArray()
    }

    onClickCloudTag = (tag) => {
        const word = tag.value
        this.props.onClickCloudWord(word)
    }
}

export default WordCloudController

// @flow
import { INLINE_PLAYER_WRAPPER_CLASS } from 'component/fileRenderFloating/view';
import * as React from 'react';
import Button from 'component/button';
import classnames from 'classnames';
import EmbedPlayButton from 'component/embedPlayButton';
import UriIndicator from 'component/uriIndicator';

type Props = {
  uri: string,
  fullUri: string,
  claim: StreamClaim,
  children: React.Node,
  description: ?string,
  isResolvingUri: boolean,
  doResolveUri: (string) => void,
  blackListedOutpoints: Array<{
    txid: string,
    nout: number,
  }>,
  playingUri: ?PlayingUri,
  parentCommentId?: string,
  isMarkdownPost?: boolean,
  allowPreview: boolean,
};

class ClaimLink extends React.Component<Props> {
  static defaultProps = {
    href: null,
    link: false,
    thumbnail: null,
    description: null,
    isResolvingUri: false,
    allowPreview: false,
  };

  componentDidMount() {
    this.resolve(this.props);
  }

  componentDidUpdate() {
    this.resolve(this.props);
  }

  isClaimBlackListed() {
    const { claim, blackListedOutpoints } = this.props;
    const signingChannel = claim && claim.signing_channel;
    if (claim && blackListedOutpoints) {
      let blackListed = false;

      blackListed = blackListedOutpoints.some(
        (outpoint) =>
          (signingChannel && outpoint.txid === signingChannel.txid && outpoint.nout === signingChannel.nout) ||
          (outpoint.txid === claim.txid && outpoint.nout === claim.nout)
      );
      return blackListed;
    }
  }

  resolve = (props: Props) => {
    const { isResolvingUri, doResolveUri, claim, uri } = props;

    if (!isResolvingUri && claim === undefined && uri) {
      doResolveUri(uri);
    }
  };

  render() {
    const {
      uri,
      fullUri,
      claim,
      children,
      isResolvingUri,
      playingUri,
      parentCommentId,
      isMarkdownPost,
      allowPreview,
    } = this.props;
    const isUnresolved = (!isResolvingUri && !claim) || !claim;
    const isBlacklisted = this.isClaimBlackListed();
    const isPlayingInline =
      playingUri &&
      playingUri.uri === uri &&
      ((playingUri.source === 'comment' && parentCommentId === playingUri.commentId) ||
        playingUri.source === 'markdown');

    if (isBlacklisted || isUnresolved) {
      return <span>{children}</span>;
    }

    const { value_type: valueType } = claim;
    const isChannel = valueType === 'channel';

    return isChannel ? (
      <>
        <UriIndicator uri={uri} link />
        <span>{fullUri.length > uri.length ? fullUri.substring(uri.length, fullUri.length) : ''}</span>
      </>
    ) : allowPreview ? (
      <div className={classnames('claim-link')}>
        <div
          className={classnames({
            [INLINE_PLAYER_WRAPPER_CLASS]: isPlayingInline,
          })}
        >
          <EmbedPlayButton uri={uri} parentCommentId={parentCommentId} isMarkdownPost={isMarkdownPost} />
        </div>
        <Button button="link" className="preview-link__url" label={uri} navigate={uri} />
      </div>
    ) : (
      <Button button="link" title={children} label={children} className="button--external-link" navigate={uri} />
    );
  }
}

export default ClaimLink;

# no-comment

no-comment is a drop-in replacement for staticman in Jekyll:
* HTML Form ➡️ JSON file
* For Cloudflare Workers
* Creates pull requests against selected branch - you have to appove manually to eliminate comment spam.

## Status
* "works for me"
* Interested to help? Please open a ticket...

## Workstation setup

Install nodejs, git and text editor, then install `wrangler`.

```shell
npm install -g wrangler
wrangler login
```

## GitHub setup

**Create a fine-grained access token**

Settings ➡️ Developer Settings ➡️ Personal access tokens ➡️ Fine-grained tokens

### Access required:
#### Repository access

* `Only select repositories`: choose repository to write to

### Permissions
#### Repository permissions

* `contents`: read and write
* `metadata`: read (mandatory)
* `pull requests`: read and write

### Important

* Save the token somewhere safe after creating it as it will only be displayed once
* Max token validity is 1 year, so remember to come back and do this again in a year

## Deploy Cloudflare Worker

1. Fork this repository
2. Clone to workstation
3. Edit `wrangler.toml`, set variables:
    * `GITHUB_OWNER`: GitHub account containing the repository to update
    * `GITHUB_REPO`: GitHub repository to update
    * `GIT_AUTHOR`: Name for comments (ignored when using personal access token)
    * `GIT_EMAIL`: email for comments (ignored when using personal access token)
    * `GIT_BRANCH_TO_MERGE_INTO`: git branch to create pull requests for
    * `COMMENT_DIR`: directory to save comments to in `GITHUB_REPO`
4. `npm install`
5. `wrangler login`
6. `npm run deploy` - note the deployment URL from this command, its needed to setup Jekyll
7. `npx wrangler secret put GITHUB_TOKEN` - when prompted enter the GitHub token created earlier

## Test locally (optional)

1. create `.dev.vars` with content: `GITHUB_TOKEN = "XXX"`, replace `XXX` with your GitHub token
2. `npm run start`

## Setup Jekyll

Add a comments section to `_layouts/post.html`:

* Adds a comment form
* Displays saved comments
* On successfully adding a comment, user is redirected

Configs needed:
* form `action`: This is the URL the Cloudflare Worker was deployed to
* `options[redirect]` URL to redirect to after successfully adding a comment. Must be fully-qualified URL
* Configure directly in HTML or add to `config.yml`

```html
<h2>Post comment</h2>
<form method="POST" action="{{ site.no_comment_url }}">
  <em><a href="https://www.markdownguide.org/">Markdown</a> is allowed, HTML is not. All comments are moderated.</em>
  <br />
  <input name="options[redirect]" type="hidden" value="{{ site.no_comment_redirect }}">
  <input name="options[slug]" type="hidden" value="{{ page.slug }}">

  <!-- e.g. "2016-01-02-this-is-a-post" -->
  <label style="width: 20px; display: inline-block">Name <input name="fields[name]" type="text"></label>
  <br/>

  <label style="width: 20px; display: inline-block">Email<input name="fields[email]" type="email"></label>
  <br/>

  <label style="width: 20px; display: inline-block">Message<textarea rows="40" cols="80" name="fields[message]"></textarea></label>
  <br/>

  <button type="submit">Post</button>
</form>

{% if site.data.comments[page.slug] %}
  <h2>Comments</h2>
  <div>
    {% for comment_entry in site.data.comments[page.slug] %}
    {% assign comment = comment_entry[1] %}
      <div>
        {{comment.date | date: "%Y-%m-%d"}} {{comment.name | strip_html}}
        <br />
        {{comment.message | strip_html | markdownify }}
      </div>
      <hr>
    {% endfor %}
  </div>
{% endif %}
```

## Supported fields

Just what I use:
* name
* email
* comment

## Acknowledgements

* Original concept: [staticman](https://github.com/eduardoboucas/staticman/)
* Inspiration: [comment-worker](https://github.com/zanechua/comment-worker)

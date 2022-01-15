# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)
- [Serverless Docs](https://www.serverless.com/framework/docs)

This package is heavily inspired by Remix's Architect starter (`arc` deployment option in `npx create-remix`).


## Serverless Setup

When deploying to AWS Lambda with the Serverless framework, you'll need:

- Serverless CLI (`sls` or `serverless`)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

Serverless recommends installing the serverless cli globally:

```sh
npm i -g serverless
```

## Development

During development, we will use the standard `remix dev` command.

```sh
npm run dev
```

If you want to use `serverless-offline` with some aspects of your project, you'll need to run that as a separate script, or use something like [concurrently](https://npm.im/concurrently) to run both processes in one command.

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

## Deploying

Before you can deploy, you'll need to [install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

If you want to use the Serverless Dashboard, you'll need to [configure the Serverless CLI](https://www.serverless.com/framework/docs/getting-started/) and add the `app` key to your `serverless.yml` file.

If you make it through all of that, you're ready to deploy!

1. build the app for production:

   ```sh
   npm run build
   ```

2. Deploy with `sls`

   ```sh
   sls deploy
   ```

You're in business!

There's a `deploy` script in `package.json` already that will handle both parts if that's your thing.

```sh
# stage defaults to "dev"
npm run deploy
# or
npm run deploy -- --stage production
# or
yarn deploy --stage production
```

The first deployment will take a little while longer because it has to set up the CloudFront distribution, so expect it to take about 5 minutes.

After deploying, if you want to visit your CloudFront endpoint, you can run `sls info --verbose` to get the `WebsiteDomain` output from the Cloudformation stack.

## The Result

After deploying, you'll have an S3 bucket for storing static assets, your Remix app running in AWS Lambda behind API Gateway, and CloudFront as a CDN in front of both services.

## Limitations and First-deployment configuration

There is a limitation when using CloudFront with API Gateway that CloudFront cannot forward the `Host` header. This means that there isn't a default way to know which
domain a user is requesting from by default. This makes `request.url` in Remix show the API Gateway domain instead of the CloudFront domain, which will be noticeable
when using redirects from actions and loaders or building URLs from the request URL. In order to address this,you need to add the `X-Forwarded-Host` to the origin cache
policy for API Gateway. The `@remix-run/architect` adapter will read this header when transforming the API Gateway request for the Remix request handler.

### Overview

1. Deploy the stack
2. run `sls info --verbose` to get the `WebsiteDomain` from "Stack  Outputs"
2. Copy the WebsiteDomain into `serverless.yml` under `custom > dev > HOST` and uncomment the `OriginCustomHeaders` block for the `RemixOrigin`.
3. Deploy again

### Deploy the stack for the first time

Follow the [deployment](#Deploying) steps.

### Get the `WebsiteDomain`
_If you [use a custom domain](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html) for your CloudFront distribution, you can skip to the next section._

After the deployment completes, run the following in your terminal at the project root:

```sh
sls info --verbose
```

You'll get an output similar to the following:

```
Serverless: Running "serverless" installed locally (in service node_modules)
Service Information
service: remix-serverless-app
stage: dev
region: us-east-1
stack: remix-serverless-app-dev
resources: 16
api keys:
  None
endpoints:
  ANY - https://xxxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/{proxy+}
functions:
  remix: remix-serverless-app-dev-remix
layers:
  None

Stack Outputs
WebsiteDomain: xxxxxxxxxxxx.cloudfront.net
WebsiteBucketName: remix-serverless-app-dev-websitebucket-somerandomid
DistributionID: XXXXXXXXXXXX
HttpApiId: xxxxxxxxxxxxx
RemixLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:xxx:function:remix-serverless-app-dev-remix:1
ServerlessDeploymentBucketName: remix-serverless-app-dev-serverlessdeploymentbuck-xxxxxxxx
HttpApiUrl: https://xxxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

From this output, copy the `WebsiteDomain` value from the "Stack Outputs" section.


### Add the X-Forwarded-Host header

In [serverless.yml](serverless.yml#L15), add paste the copied WebsiteDomain value.

```yml
custom:
  dev:
    HOST: xxxxxxxxxxxx.cloudfront.net # Replace this value
```

Then, uncomment the [`OriginCustomHeaders` block](serverless.yml#L148):

```yml
  OriginCustomHeaders:
    - HeaderName: X-Forwarded-Host
      HeaderValue: ${self:${self:provider.stage}.HOST}
```

### Deploy again!

```sh
  sls deploy
  # or npm run deploy
```

After deploying, your Remix app will use the domain from the X-Forwarded-Host header as the domain.

You'll want to add a domain for the `prod` or any other deployment stages you intend to use as well. If you [configure CloudFront to use a custom domain](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html), you will need to use your custom domain as the value instead of the CloudFront default.

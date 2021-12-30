# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)
- [Serverless Docs]()

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
   $ npm run build
   ```

2. Deploy with `sls`

   ```sh
   $ sls deploy --stage production
   ```

You're in business!

There's a `deploy` script in `package.json` already that will handle both parts if that's your thing.

```sh
npm run deploy
# or
npm run deploy -- --stage production
# or
yarn deploy --stage production
```

The first deployment will take a little while longer because it has to set up the Cloudfront distribution, so expect it to take about 5 minutes.

After deploying, if you want to visit your Cloudfront endpoint, you can run `sls info --verbose` to get the `WebsiteDomain` output from the Cloudformation stack.

## The Result

After deploying, you'll have an S3 bucket for storing static assets, your Remix app running in AWS Lambda behind API Gateway, and Cloudfront as a CDN in front of both services.
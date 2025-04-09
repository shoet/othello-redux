import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class OthelloFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const cdkRoot = process.cwd();

    // S3
    const sourceBucket = new cdk.aws_s3.Bucket(this, "SourceBucket", {
      bucketName: `othello-frontend-bucket-${props.stage}`,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: "index.html",
      removalPolicy:
        props.stage === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== "prod",
    });

    // CloudFrontOAC
    const cloudFrontOAC = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "OAC",
      {
        comment: `Othello Frontend OAC ${props.stage}`,
      }
    );

    const acmCertificateArn =
      cdk.aws_ssm.StringParameter.valueForStringParameter(
        this,
        `/othello-frontend/${props.stage}/ACM_CERTIFICATE_ARN`
      );
    const hostedZoneId = cdk.aws_ssm.StringParameter.valueForStringParameter(
      this,
      `/othello-frontend/${props.stage}/HOSTED_ZONE_ID`
    );
    const hostedZoneName = cdk.aws_ssm.StringParameter.valueForStringParameter(
      this,
      `/othello-frontend/${props.stage}/HOSTED_ZONE_NAME`
    );
    const frontendDomain = cdk.aws_ssm.StringParameter.valueForStringParameter(
      this,
      `/othello-frontend/${props.stage}/FRONTEND_DOMAIN`
    );

    // existing ACM Certificate
    const certificate =
      cdk.aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        "Certificate",
        acmCertificateArn
      );

    // CloudFront
    const cloudFrontDistribution = new cdk.aws_cloudfront.Distribution(
      this,
      "Distribution",
      {
        defaultBehavior: {
          origin:
            cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
              sourceBucket,
              {
                originAccessControlId: cloudFrontOAC.originAccessIdentityName,
              }
            ),
          compress: true,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
        certificate: certificate,
        domainNames: [frontendDomain],
      }
    );

    // S3 Deployment
    new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "OthelloFrontendDeployment",
      {
        sources: [cdk.aws_s3_deployment.Source.asset(`${cdkRoot}/../dist`)],
        destinationBucket: sourceBucket,
        distribution: cloudFrontDistribution,
        distributionPaths: ["/*"],
      }
    );

    // existing Route53 hosted zone
    const route53HostedZone =
      cdk.aws_route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
        hostedZoneId,
        zoneName: hostedZoneName,
      });

    new cdk.aws_route53.ARecord(this, "ARecord", {
      zone: route53HostedZone,
      recordName: `${frontendDomain}.`,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(cloudFrontDistribution)
      ),
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionDomainName", {
      value: cloudFrontDistribution.distributionDomainName,
    });
  }
}

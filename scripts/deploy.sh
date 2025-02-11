#!/bin/bash

StackName="LlmExeLambda"
IS_DEPLOY="no"
IS_SYNTH="no"
IS_BOOTSTRAP="no"
IS_UPDATE_SSM="no"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -synth)
            IS_SYNTH="yes"
            shift
        ;;
        -deploy)
            IS_DEPLOY="yes"
            shift
        ;;
        -bootstrap)
            IS_BOOTSTRAP="yes"
            IS_UPDATE_SSM="yes"
            shift
        ;;
        -update-secrets)
            IS_UPDATE_SSM="yes"
            shift
        ;;
        *) # unknown
            shift
        ;;
    esac
done

if [ $IS_UPDATE_SSM = "yes" ]; then
    # check is OPEN_AI_API_KEY is set, then create ssm secret
    if [ -n "$OPEN_AI_API_KEY" ]; then
        CREATE_SSM_SECRET_OPEN_AI=$(aws ssm put-parameter \
        --name "/$StackName/Secret/KeyOpenAI" \
        --value "$OPEN_AI_API_KEY" \
        --profile "$DEPLOY_PROFILE" \
        --type "SecureString" \
        --overwrite)
    fi

    # check is ANTHROPIC_API_KEY is set, then create ssm secret
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        CREATE_SSM_SECRET_ANTHROPIC=$(aws ssm put-parameter \
        --name "/$StackName/Secret/KeyAnthropic" \
        --value "$ANTHROPIC_API_KEY" \
        --profile "$DEPLOY_PROFILE" \
        --type "SecureString" \
        --overwrite)
    fi
fi

if [ $IS_BOOTSTRAP = "yes" ]; then
    # bootstrap stack
    npx cdk bootstrap -a "ts-node stack/index.ts"  \
    --profile "$DEPLOY_PROFILE" \
    --cloudformation-execution-policies "arn:aws:iam::$DEPLOY_ACCOUNT:policy/LlmExeLambdaCdkPermissionBoundaryPolicy"
fi

if [ $IS_SYNTH = "yes" ]; then
    npx cdk synth
fi

if [ $IS_DEPLOY = "yes" ]; then
    npx cdk deploy -a "ts-node stack/index.ts" "$StackName" \
    --profile "$DEPLOY_PROFILE"
fi
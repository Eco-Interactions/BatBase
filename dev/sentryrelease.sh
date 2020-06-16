# Assumes you're in a git repository
export SENTRY_AUTH_TOKEN=0dbc42455f464453aab6908b16b682a5940db190812341caa08b5c452317a0ed
export SENTRY_ORG=bat-eco-interactions
# Stores current date
VERSION=$(date +'%Y%m%d')_BB
# Create a release
./node_modules/@sentry/cli/sentry-cli releases new -p javascript -p symfony $VERSION
# Associate commits with the release
./node_modules/@sentry/cli/sentry-cli releases set-commits $VERSION --auto #--log-level=debug
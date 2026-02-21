#!/bin/bash
# docker-cleanup.sh - Clean up old Docker containers and images on Synology
# Run on Synology: ssh mike@10.1.11.98 -p 2222 'bash -s' < scripts/docker-cleanup.sh

set -e

DOCKER=/var/packages/ContainerManager/target/usr/bin/docker

echo "=== Docker Cleanup Script ==="
echo "Date: $(date)"
echo

# Show current state
echo "=== Current Disk Usage ==="
$DOCKER system df
echo

# List stopped containers older than 30 days
echo "=== Stopped Containers (candidates for removal) ==="
$DOCKER ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
echo

# List dangling images
echo "=== Dangling Images ==="
$DOCKER images -f "dangling=true" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
echo

# Dry run - show what would be removed
echo "=== Would Remove (dry run) ==="

# Old containers to remove
OLD_CONTAINERS="mariadb-reader strapi02-strapi-1 strapi02-db-1 python1"
for c in $OLD_CONTAINERS; do
    if $DOCKER ps -a --format '{{.Names}}' | grep -q "^${c}$"; then
        echo "Container: $c"
    fi
done

# Count dangling images
DANGLING_COUNT=$($DOCKER images -f "dangling=true" -q | wc -l)
echo "Dangling images: $DANGLING_COUNT"
echo

# Prompt for confirmation
read -p "Remove these containers and images? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "=== Removing old containers ==="
    for c in $OLD_CONTAINERS; do
        if $DOCKER ps -a --format '{{.Names}}' | grep -q "^${c}$"; then
            echo "Removing $c..."
            $DOCKER rm "$c"
        fi
    done

    echo "=== Removing dangling images ==="
    $DOCKER image prune -f

    echo "=== Removing unused images older than 7 days ==="
    $DOCKER image prune -a --filter "until=168h" -f

    echo "=== Final Disk Usage ==="
    $DOCKER system df
else
    echo "Aborted."
fi

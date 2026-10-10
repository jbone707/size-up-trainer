# Changing this file and pushing runs the image job. Settings below are read by the workflow.
# ONLY: comma-separated codes to make (blank means all). PER_PROMPT: versions per scene.
# MAX_IMAGES: hard cap on images for one run, a spending guard.
RUN=4
PROMPTS_FILE=scripts/image-prompts-b2.json
ONLY=
PER_PROMPT=2
IMAGE_QUALITY=medium
MAX_IMAGES=200
LANES=5

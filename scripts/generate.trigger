# Changing this file and pushing runs the image job. Settings below are read by the workflow.
# ONLY: comma-separated codes to make (blank means all). PER_PROMPT: versions per scene.
# MAX_IMAGES: hard cap on images for one run, a spending guard.
RUN=5
PROMPTS_FILE=scripts/image-prompts-b2.json
ONLY=B-RES-44,B-RES-45,B-MF-01,B-MF-02,B-MF-03,B-MF-04,B-MF-05,B-MF-06,B-MF-07,B-MF-08,B-MF-09,B-MF-10,B-MF-11,B-MF-12,B-MF-13,B-MF-14,B-MF-15,B-MF-16,B-COM-01,B-COM-02,B-COM-03,B-COM-04,B-COM-05,B-COM-06,B-COM-07,B-COM-08,B-COM-09,B-COM-10,B-COM-11,B-COM-12,B-COM-13,B-COM-14,B-HR-01,B-HR-02,B-HR-03,B-HR-04,B-HR-05,B-HR-06,B-VEG-01,B-VEG-02,B-VEG-03,B-VEG-04,B-VEG-05,B-VEG-06,B-VEG-07,B-VEG-08,B-VEH-01,B-VEH-02,B-VEH-03,B-VEH-04,B-VEH-05,B-VEH-06,B-VEH-07,B-VEH-08,B-VEH-09
PER_PROMPT=2
IMAGE_QUALITY=medium
MAX_IMAGES=120
LANES=3

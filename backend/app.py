import boto3
import botocore.config
import json
import logging
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def travel_guide_using_bedrock(travel_guide):
    prompt = f"""Human: `You are a world-renowned travel advisor with expertise in providing personalized travel recommendations based on individual hobbies and interests. Your extensive knowledge spans both international and domestic destinations, and you are recognized by major travel organizations for your expertise in travel planning.

### Instructions ###

- Always answer to the user in the main language of their message.
- You must provide tailored travel recommendations based on the user's hobbies.
- Once a destination is selected, you must offer transportation and accommodation options at different price points.
- You must highlight scenic areas and attractions around the selected destination.
- You must follow the "Chain of Thoughts" before answering.

### Chain of Thoughts ###

1. **Identifying User's Hobby:**
   1.1. Ask the user about their hobbies and interests.
   1.2. Identify suitable travel destinations that align with the user's hobbies.

2. **Recommending Destinations:**
   2.1. Provide a list of potential destinations, both international and domestic, that cater to the user's hobbies.
   2.2. Include a brief description of why each destination is ideal for the specified hobby.

3. **Providing Transportation Options:**
   3.1. For the selected destination, offer various transportation options (e.g., flights, trains, buses).
   3.2. Include options for different budget levels, from economy to premium.

4. **Recommending Accommodation:**
   4.1. Suggest a range of hotels or lodging options in the destination, categorized by price (e.g., budget, mid-range, luxury).
   4.2. Provide details about the amenities and services available at each accommodation option.

5. **Highlighting Scenic Areas:**
   5.1. List popular scenic areas and attractions near the selected destination.
   5.2. Provide information about activities and sights that align with the user's hobbies and interests.

### What Not To Do ###

- Never provide generic or one-size-fits-all travel recommendations.
- Never ignore the user's specified hobbies and interests when suggesting destinations.
- Never suggest transportation or accommodation options that are not relevant to the user's budget preferences.
- Never omit information about nearby scenic areas or attractions.
- Never assume the user has prior knowledge of the destinations; always provide clear and detailed descriptions.

### Few-Shot Example ###

**User Hobby: Hiking**

**Recommended Destinations:**
- **International:**
  - **Switzerland (Zermatt):** Ideal for hiking with stunning trails around the Matterhorn.
  - **New Zealand (Queenstown):** Known for its picturesque hiking routes and adventure sports.
- **Domestic (USA):**
  - **Colorado (Aspen):** Offers beautiful hiking trails in the Rocky Mountains.
  - **California (Yosemite National Park):** Famous for its breathtaking hikes and natural beauty.

**Transportation Options:**
- **To Zermatt:**
  - Flights: Economy ($500), Business ($1,200)
  - Train from Zurich: Standard ($100), First Class ($200)
- **To Queenstown:**
  - Flights: Economy ($800), Business ($1,500)
  - Shuttle from airport: Budget ($20), Private Transfer ($100)

**Accommodation Options in Zermatt:**
- Budget: Hotel Alpenblick ($100/night) - Basic amenities, free Wi-Fi
- Mid-Range: Hotel Bristol ($200/night) - Comfortable rooms, breakfast included
- Luxury: The Omnia ($400/night) - Luxury suites, spa services, stunning views

** Scenic Areas in Zermatt:**
- **Gornergrat Railway:** Offers panoramic views of the Matterhorn and surrounding peaks.
- **Five Lakes Walk:** A scenic hike featuring five beautiful mountain lakes.
- **Matterhorn Glacier Paradise:** The highest cable car station in Europe with breathtaking views.`
    Assistant:
    """

    body = {
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 4096,
            "stopSequences": [],
            "temperature": 0.1,
            "topP": 0.9
        }
    }

    try:
        bedrock = boto3.client(
            "bedrock-runtime",
            region_name="ap-south-1",
            config=botocore.config.Config(read_timeout=300, retries={'max_attempts': 3})
        )
        response = bedrock.invoke_model(
            body=json.dumps(body), 
            modelId="amazon.titan-text-express-v1"
        )

        response_content = response.get('body').read()
        response_data = json.loads(response_content)
        logger.info("Bedrock response received successfully.")
        return response_data['results'][0]['outputText']
    except Exception as e:
        logger.error(f"Error generating the travel guide: {e}")
        return ""

def save_blog_details_s3(s3_key, s3_bucket, generate_answer):
    s3 = boto3.client('s3')

    try:
        s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=generate_answer)
        logger.info("Generated travel guide saved to S3 successfully.")
    except Exception as e:
        logger.error(f"Error when saving the travel guide to S3: {e}")

def lambda_handler(event, context):
    try:
        event = json.loads(event['body'])
        travel_guide = event['text_input']

        generate_answer = travel_guide_using_bedrock(travel_guide)

        if generate_answer:
            current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"travel-output/{current_time}.txt"
            s3_bucket = 'aws-bedrock-travel'
            save_blog_details_s3(s3_key, s3_bucket, generate_answer)
        else:
            logger.info("No Travel Guide was generated.")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'content': generate_answer})
        }

    except Exception as e:
        logger.error(f"Error in lambda_handler: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Something went wrong.'})
        }

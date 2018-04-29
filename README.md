Kubernetes Admission Webhook

## Steps
1. Create a google cloud function to process the requests  
```gcloud beta functions deploy addenvoy --trigger-http```
2. Add MutatingWebhookConfiguration to your k8s cluster  
```kubectl apply -f mutate.yaml```
3. Create any new deployment to see envoy container automatically being added


### References
https://github.com/kelseyhightower/denyenv-validating-admission-webhook
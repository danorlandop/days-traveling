"""
Generates a .shortcut file (signed plist) for the travel backfill shortcut.
Run: python3 scripts/generate-shortcut.py
Output: scripts/TravelBackfill.shortcut
"""
import plistlib, uuid, json
from pathlib import Path

API_URL = "https://days-traveling.vercel.app/api/checkin"
SECRET  = "b51ce9188dafbfd589024815dcf12bf5"

def uid():
    return str(uuid.uuid4()).upper()

shortcut = {
    "WFWorkflowClientVersion": "2605.0.2",
    "WFWorkflowMinimumClientVersion": 900,
    "WFWorkflowMinimumClientVersionString": "900",
    "WFWorkflowIcon": {
        "WFWorkflowIconStartColor": 431817727,
        "WFWorkflowIconGlyphNumber": 59511,
    },
    "WFWorkflowImportQuestions": [],
    "WFWorkflowInputContentItemClasses": [],
    "WFWorkflowTypes": [],
    "WFWorkflowActions": [
        # 1. Find Photos (last 365 days, limit 500)
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getlatestphotos",
            "WFWorkflowActionParameters": {
                "WFGetLatestPhotosActionCount": 500,
            },
        },
        # 2. Repeat with each photo
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.repeat.each",
            "WFWorkflowActionParameters": {
                "WFControlFlowMode": 0,  # start repeat
                "UUID": uid(),
            },
        },
        # 3. Get photo location
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getdetailofimages",
            "WFWorkflowActionParameters": {
                "WFImageDetail": "Location",
                "WFOutput": "PhotoLocation",
            },
        },
        # 4. Get latitude
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.location.getcomponent",
            "WFWorkflowActionParameters": {
                "WFLocationDetail": "Latitude",
                "WFInput": {"Value": {"Type": "Variable", "VariableName": "PhotoLocation"}, "WFSerializationType": "WFTextTokenAttachment"},
                "WFOutput": "PhotoLat",
            },
        },
        # 5. Get longitude
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.location.getcomponent",
            "WFWorkflowActionParameters": {
                "WFLocationDetail": "Longitude",
                "WFInput": {"Value": {"Type": "Variable", "VariableName": "PhotoLocation"}, "WFSerializationType": "WFTextTokenAttachment"},
                "WFOutput": "PhotoLon",
            },
        },
        # 6. Get date taken
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getdetailofimages",
            "WFWorkflowActionParameters": {
                "WFImageDetail": "Date Taken",
                "WFOutput": "PhotoDate",
            },
        },
        # 7. Get contents of URL (POST)
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.downloadurl",
            "WFWorkflowActionParameters": {
                "WFHTTPMethod": "POST",
                "WFURL": API_URL,
                "WFHTTPHeaders": {
                    "Value": {
                        "WFDictionaryFieldValueItems": [
                            {
                                "WFItemType": 0,
                                "WFKey": {"Value": {"string": "Authorization"}, "WFSerializationType": "WFTextTokenString"},
                                "WFValue": {"Value": {"string": f"Bearer {SECRET}"}, "WFSerializationType": "WFTextTokenString"},
                            },
                            {
                                "WFItemType": 0,
                                "WFKey": {"Value": {"string": "Content-Type"}, "WFSerializationType": "WFTextTokenString"},
                                "WFValue": {"Value": {"string": "application/json"}, "WFSerializationType": "WFTextTokenString"},
                            },
                        ]
                    },
                    "WFSerializationType": "WFDictionaryFieldValue",
                },
                "WFHTTPBodyType": "JSON",
                "WFHTTPRequestJSONBody": {
                    "Value": {
                        "WFDictionaryFieldValueItems": [
                            {
                                "WFItemType": 0,
                                "WFKey": {"Value": {"string": "lat"}, "WFSerializationType": "WFTextTokenString"},
                                "WFValue": {"Value": {"Type": "Variable", "VariableName": "PhotoLat"}, "WFSerializationType": "WFTextTokenAttachment"},
                            },
                            {
                                "WFItemType": 0,
                                "WFKey": {"Value": {"string": "lon"}, "WFSerializationType": "WFTextTokenString"},
                                "WFValue": {"Value": {"Type": "Variable", "VariableName": "PhotoLon"}, "WFSerializationType": "WFTextTokenAttachment"},
                            },
                            {
                                "WFItemType": 0,
                                "WFKey": {"Value": {"string": "timestamp"}, "WFSerializationType": "WFTextTokenString"},
                                "WFValue": {"Value": {"Type": "Variable", "VariableName": "PhotoDate"}, "WFSerializationType": "WFTextTokenAttachment"},
                            },
                        ]
                    },
                    "WFSerializationType": "WFDictionaryFieldValue",
                },
            },
        },
        # 8. End repeat
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.repeat.each",
            "WFWorkflowActionParameters": {
                "WFControlFlowMode": 2,  # end repeat
            },
        },
    ],
}

out = Path("scripts/TravelBackfill.shortcut")
with open(out, "wb") as f:
    plistlib.dump(shortcut, f, fmt=plistlib.FMT_XML)

print(f"Written to {out}")

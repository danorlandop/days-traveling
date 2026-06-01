"""
Generates a .shortcut file for the daily location check-in automation.
Run: python3 scripts/generate-checkin-shortcut.py
Output: scripts/DailyCheckin.shortcut
"""
import plistlib, uuid
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
        "WFWorkflowIconStartColor": 255,
        "WFWorkflowIconGlyphNumber": 59514,
    },
    "WFWorkflowImportQuestions": [],
    "WFWorkflowInputContentItemClasses": [],
    "WFWorkflowTypes": [],
    "WFWorkflowActions": [
        # 1. Get current location
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.location",
            "WFWorkflowActionParameters": {
                "WFLocationAccuracy": "Reduced",
            },
        },
        # 2. Get latitude
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.location.getcomponent",
            "WFWorkflowActionParameters": {
                "WFLocationDetail": "Latitude",
                "WFOutput": "Lat",
            },
        },
        # 3. Get longitude
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.location.getcomponent",
            "WFWorkflowActionParameters": {
                "WFLocationDetail": "Longitude",
                "WFOutput": "Lon",
            },
        },
        # 4. POST to checkin API
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
                                "WFValue": {"Value": {"Type": "Variable", "VariableName": "Lat"}, "WFSerializationType": "WFTextTokenAttachment"},
                            },
                            {
                                "WFItemType": 0,
                                "WFKey": {"Value": {"string": "lon"}, "WFSerializationType": "WFTextTokenString"},
                                "WFValue": {"Value": {"Type": "Variable", "VariableName": "Lon"}, "WFSerializationType": "WFTextTokenAttachment"},
                            },
                        ]
                    },
                    "WFSerializationType": "WFDictionaryFieldValue",
                },
            },
        },
    ],
}

out = Path("scripts/DailyCheckin.shortcut")
with open(out, "wb") as f:
    plistlib.dump(shortcut, f, fmt=plistlib.FMT_XML)

print(f"Written to {out}")

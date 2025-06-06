<?php

header("Access-Control-Allow-Origin: http://ucfgroup9.xyz");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); 
    exit();
}

    $inData = getRequestInfo();

    $contactId = $inData["contactId"];
    $userId = $inData["userId"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
        $stmt->bind_param("ss", $contactId, $userId);

        if ($stmt->execute())
        {
            if ($stmt->affected_rows > 0)
            {
                returnWithError(""); //success, no error
            }
            else
            {
                returnWithError("No contact found.");
            }
        }
        else
        {
            returnWithError("Delete failed.");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }
?>

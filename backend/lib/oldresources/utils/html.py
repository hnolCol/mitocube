
def addHeader(html : str, text : str="Header"):
    ""
    html += f"<h3>{text}</h3>"
    return html 

def addSubHeader(html : str, text : str="SubHeader"):
    ""
    html += f"<h4>{text}</h4>"
    return html 

def addTextElement(html : str, text : str):
    html += f"<p>{text}</p>"
    return html

def addTextElementInNewLine(html,text=""):
    html += f"<br>{text}"
    return html

def addList(html,listItems : dict):
    l = "<ul>"

    for header, itemText in listItems.items():
        l += f"<li>{header}: {', '.join(itemText) if isinstance(itemText,list) else itemText}</li>"

    l += "</ul>"
    html += l
    return html 
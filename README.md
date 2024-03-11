# MitoCube

Welcome to the MitoCube respository. MitoCube is a full stack web application to manage proteomics data.

* Protein-centric data visualization
* Dataset-centric analysis and visualization including volcano plots, networks and heatmaps 
* Submission management (Submitting samples, state changes, transferring to data visualization parts) 

## Application

The application is written in ReactJS (frontend)[https://github.com/hnolcol/mitocube-frontend] and Python (FastAPI-based backend)[https://github.com/hnolcol/mitocube-frontend].


## Installation

### Frontend 


### Backend

Please visit the backend installation help. 
The backend installation requires the input and adjustment of several settings, creation of folders. 
MitoCube creates a lead account (system admin) upon start, therefore it is fundamental to have an  

* Sudo rights 
* Install nginx, python 3.11 
* Email account set up to send verification codes


#### Attributes 

MitoCube utilizes controlled vocabulary (attributes) to define metadata. Even though there is a comprehensive set of attributes predefined, you may want to adjust them to your needs. 
Attributes can have a defined set of attribute values, numeric input (user types in, for example: column length, time), as well as features (by default Proteins). 
Attributes can be defined for a dataset (e.g. true for all samples) or samples specific. 
The attributes can be managed via the user interface (ui) or setup in an Excel file. 
An attribute has a defined set of parameters. An attribute can be defined as ```mandatory_for_active``` which means that it must be set for a dataset before it can be published. Published in terms of MitoCube means that
it is accessible to all users in the MitoCube, not to the outside world.

```python 
class AttributeModel(BaseModel):
    """
    BaseModel for Attributes
    id : int 
        The identifier of the attribute
    tag : str 
        Attribute tag, is validated to be of style ``att_<text>``
    text : str
        Attribute text to be displayed to a user in a ui. 
    priority : int, default 500 
        Priority of the attribute 
    parent_id : int, optional, default None
        The id of the parent attribute. Use for visualization in the ui.  
    parent_tag : str, optional, default None
        Tag tag of the parent attribute. 
    group_tag : str 
        Specifying the type of attribute. 
    mandatory_for_submission : bool, default False
        If true, the attribute must be defined upon submission of a new project.
    mandatory_for_active : bool, default False 
        If true, the attribute must be defined before the data of the dataset can be explored. 
    has_feature_value : bool, default False 
        If true, the attribute_values are the features (proteins) present in the database 
    has_numeric_input : bool, default False 
        If true, the attribute can be defined by a simple numeric value (e.g. attribute_value). 
    min_state : int, default 0
        The minimal state defined in ``SubmissionStates`` the submission must be in to allow the attribute
        to be defined. For example, upon changing the submission to ``MEASURING`` the mass spectrometer should be defined. 
        But this information is not yet available at submission. 
    allow_as_qc : bool, default False
        Allow the attribute for quality control 
    allow_as_filter : bool, default True
        If True, the attribute can be used to filter datasets/submissions. 
    allow_for_dataset : bool, default False 
        If True, the attribute can be used to define a dataset. 
    allow_for_user : bool, default False 
        If true, the attribute can be used to define a user. 
    """
    id : int
    tag : str 
    text : str 
    priority : int = 500  
    parent_id : Optional[int] = None  
    parent_tag : Optional[str] = None  
    group_tag : str  
    mandatory_for_submission : bool = False 
    mandatory_for_active : bool = False  
    has_features_value : bool = False 
    has_numeric_input : bool = False  
    min_state : int = 0  
    allow_as_qc : bool = False 
    allow_as_filter : bool = True  
    allow_for_measurement : bool = True  
    allow_for_genotype : bool = False  
    allow_for_dataset : bool = False  
    allow_for_user : bool = False
    unit : Optional[Literal["length","concentration","weight","time"]] = None # ToDo: define units like this? 
```



 
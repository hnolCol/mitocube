from .dataset.AdminDataset import AdminDataset
from .dataset.Summary import DatasetsSummary
from .dataset.Params import DatasetParams
from .dataset.Examples import DatasetExample, DatasetParamsExample
from .dataset.FileStorage import FileStorageService, FileStorageServiceWithoutToken
from .dataset.Details import DatasetDetails, DatasetGroupings, DatasetExperimentalInfo, DatasetsHeatmap, DatasetsVolcano, DatasetSearch
from .dataset.MitoMap import DatasetsMitoMap
from .feature.Features import Features, FeaturesInDatasets, FeatureDetails, FeatureDBInfo, FeatureSummary
from .feature.cards.Correlations import CorrelationsToFeature
from .feature.cards.Layout import CardLayout
from .submission.Submissions import DataSubmissionID, DataSubmissionDetails, DataSubmissions, SampleList
from .filter.Filter import Filter
from .login.Login import LoginWebsite, TokenValid, AdminLoginWebsite, AdminLoginValidation, AdminTokenValid, AdminUser
from .performance.ShareToken import ShareTokenValid, ShareToken
from .performance.ShareData import ShareData, ShareDataDetails
from .ptm.PTM import PTMView, PTMItems
from .website.Welcome import WelcomeText, News, KeyFigures, DendrogramTest, DataTest, TestMitoCarta


mitoCubeResources = [
    {
        "url":'/api/dataset/mitoloc',
        "obj":  TestMitoCarta,
        "reqKwargs" : ["token","data"]
    },
    {
        "url":'/api/features/data',
        "obj":  DataTest,
        "reqKwargs" : ["token","featureFinder","data"]
    },
    {
        "url":'/api/dendro',
        "obj":  DendrogramTest,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/keyfigures',
        "obj":  KeyFigures,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/news',
        "obj":  News,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/website/welcome',
        "obj":  WelcomeText,
        "reqKwargs" : ["data"]
    },
    {
        "url":'/api/login',
        "obj":  LoginWebsite,
        "reqKwargs" : ["token","data"]
    },
        {
        "url":'/api/login/admin',
        "obj":  AdminLoginWebsite,
        "reqKwargs" : ["token","data","email","user"]
    },
    {
        "url":'/api/login/admin/validate',
        "obj":  AdminLoginValidation,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/token/valid',
        "obj":  TokenValid,
        "reqKwargs" : ["token","data"]
    },
    {
        "url":'/api/token/admin/valid',
        "obj":  AdminTokenValid,
        "reqKwargs" : ["token","user"]
    },
    {
        "url":'/api/dataset',
        "obj": FileStorageService,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/example',
        "obj": DatasetExample,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/instantclue',
        "obj": FileStorageServiceWithoutToken,
        "reqKwargs" : ["data","token"]
    },
    # {
    #     "url":'/api/dataset/data',
    #     "obj": FileStorageService,
    #     "reqKwargs" : ["data","token"]
    # },
    # {
    #     "url":'/api/dataset/params',
    #     "obj": DatasetParams,
    #     "reqKwargs" : ["data","token"]
    # },
    {
        "url":'/api/dataset/params/example',
        "obj": DatasetParamsExample,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/info',
        "obj": DatasetDetails,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/features',
        "obj": DatasetSearch,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/dataset/groupings',
        "obj": DatasetGroupings,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/features',
        "obj": Features,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/details',
        "obj": FeatureDetails,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/summary',
        "obj": FeatureSummary,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/datasets',
        "obj": FeaturesInDatasets,
        "reqKwargs" : ["featureFinder","token"]
    },
    # {
    #     "url":'/api/features/cards/data',
    #     "obj": ChartDataForFeatures,
    #     "reqKwargs" : ["data","token"]
    # },
    {
        "url":'/api/features/cards/data/correlation',
        "obj": CorrelationsToFeature,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/features/cards',
        "obj": CardLayout,
        "reqKwargs" : ["data","featureFinder","token"]
    },
    {
        "url":'/api/features/db/info',
        "obj": FeatureDBInfo,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/filter/options',
        "obj": Filter,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/details/experimentalInfo',
        "obj": DatasetExperimentalInfo,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/summary',
        "obj": DatasetsSummary,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/heatmap',
        "obj": DatasetsHeatmap,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/volcano',
        "obj": DatasetsVolcano,
        "reqKwargs" : ["data","token"]
    },
    ### Mitomap
    {
        "url":'/api/data/mitomap',
        "obj": DatasetsMitoMap,
        "reqKwargs" : ["data","token"]
    },
    ###Sample submission
    {
        "url":'/api/data/submission/id',
        "obj": DataSubmissionID,
        "reqKwargs" : ["data","token","submission"]
    },
    {
        "url":'/api/data/submission/details',
        "obj": DataSubmissionDetails,
        "reqKwargs" : ["data","token","email","submission"]
    },
    {
        "url":'/api/admin/submissions',
        "obj": DataSubmissions,
        "reqKwargs" : ["token","submission"]
    },
    ### Admin Users
    {
        "url":'/api/admin/users',
        "obj": AdminUser,
        "reqKwargs" : ["token","user"]
    },
    ### Sample list
    {
        "url":'/api/admin/samplelist',
        "obj": SampleList,
        "reqKwargs" : ["token","submission"]
    },
    ## admin datasets
    {
        "url":'/api/admin/datasets',
        "obj": AdminDataset,
        "reqKwargs" : ["token","data"]
    },
    ##performance data sharing
    {
        "url":'/api/admin/shareToken/valid',
        "obj": ShareTokenValid,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/admin/shareToken',
        "obj": ShareToken,
        "reqKwargs" : ["token"]
    },
        {
        "url":'/api/admin/performance',
        "obj": ShareData,
        "reqKwargs" : ["token","performance","data"]
    },
    {
        "url":'/api/admin/performance/details',
        "obj": ShareDataDetails,
        "reqKwargs" : ["token","performance"]
    },
    ## ptms
    {
        "url":'/api/ptm/items',
        "obj": PTMItems,
        "reqKwargs" : ["token","ptm"]
    },
    {
        "url":'/api/ptm',
        "obj": PTMView,
        "reqKwargs" : ["token","ptm","libs"]
    }
]




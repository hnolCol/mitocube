import { Link } from "react-router-dom";

const FAQ =   [
    
    {
        q:"How to download graph data?",
        a:
            <p>You can download the data over the <Link to="/help/cards/header">menu icon</Link> and then selected <b>Download Data</b>. The data will be
            downloaded as a tab-delimited text file and can be opened in spreadsheet software tools such as Excel or Open Office. Please note that the
            data can also be directly imported into <a href="https://github.com/hnolcol/instantclue/releases" target="_blank" rel="noopener noreferrer">Instant Clue </a> 
            and MitoCube graphs styles are inspired by the software output.</p>
    },
    {
        q:"How to save the graph?",
        a:
            <p>You can download the graph using the <Link to="/help/cards/header">menu icon</Link>. You can choose between the .png and .svg format. Using 
            svg (scallable vector graphic) allows you to open the graph in software tools such as Adobe illustrator or Coreldraw to adapt the graph to your needs.</p>
    }
]                  
    

export const helpDetails = {

    "overview" : 
                <div>
                    <h2>Overview</h2>
                    <p>MitoCube represents a database of proteomics experiments. Mito indicates that the experiments were designed in order to elucidate mitochondrial processes and adaptions.</p>
                </div>,

    "statistics" : 

                <div>
                    <h2>Statistics</h2>
                    <p>MitoCube calculates several statistics for each protein including</p>
                    <ol>
                        <li><p>Number of whole proteomics experiment in which the protein / feature was detected. Please note that this includes only
                            whole proteome experiments.
                        </p></li>
                        <li><p>Median intensity represented as in a boxplot.</p></li>
                        <li>Analysis of variance (N-way ANOVA) depending on the number of groupings available.</li>
                    </ol>
                    <p>Please see the image below of the summary card.</p>
                </div>,

    "cards-graph" : 

                <div>
                    <h2>Card Graphs</h2>
                    <p>A card is generated per experiment in which the requested feature (e.g. protein) has been identified. If the protein has not been identified in the proteomics experiments, no card will be shown.</p>
                    <p>Additionally, there is a so called summary card which summarizes the information about a protein of all datasets.</p>
                </div>,

    "cards-header" : 
                <div>
                    <h2>Card Headers</h2>
                    <p>The Card header is the upper part of the card and enables the user for numerous actions. The header of the card (short description) of the project is shown in the upper-left corner</p>
                    <p>
                        The colored circle indicates the type of the experiment (such as whole proteomics, Neo N-termiomics, phosphoproteomics). 
                        Please note that users can filter for specific type of experiments using the short cut filter option in the very bottom-left corner.
                        The next bottom allows users to switch between two main views.
                    </p>
                    <ul>
                        <p>A. Boxplot - expression details of the feature.</p>
                        <p>B. Heatmap - positive correlations to the selected feature.</p>
                    </ul>
                    <p>
                    
                        <h3>Menu</h3>
                        <p>The menu allows for the following options:
                            <ol>
                                <li>View experiment information including details about the biological material, the Protein Digestion and/or enrichment strategy and LC-MS/MS settings.</li>
                                <li>Download Data</li>
                                <li>Download shwon graph as svg and png</li>
                                <li>Remove experiment card</li>
                            </ol>
                        </p>
                    </p>
                </div>,
    "cards" : 
                <div>
                    <h2>Cards</h2>
                    <p>
                        Within MitoCube, Cards are used to display the results of an experiment. Results of each experiment that is present in the MitoCube database 
                        is shown in a single card. For this tutorial, the Card is divided into the <Link to="/help/cards/header">header</Link> and the <Link to="/help/cards/graph">graph</Link> part. 
                        
                    </p>
                    
                </div>,     
    "faqs"  : 
                <div>
                    <h2>Frequently asked questions</h2>
                    {FAQ.map(v => {return(
                           <div key={v.q}><h4>{v.q}</h4>{v.a}</div> 
                    )})}

                </div>        
    
}
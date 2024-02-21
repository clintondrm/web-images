var editor = {
    input: null,
    image: null,
    croppieInstance: null,
    filename: null,
    filenameInput: null,
    originalWidth: null,
    originalHeight: null,
    originalSize: null,
    intrinsicWidth: null,
    intrinsicHeight: null,
    intrinsicSize: null,
    croppie11: null,
    croppie21: null,
    croppie31: null,
    croppie31b: null,
    croppie32: null,
    croppie32b: null,
    croppie32c: null,
    croppieOrig: null,
    croppieArb: null,
    croppies: [],
    quality: .95,

    init: function (i) {
        console.log('Initializing Editor...');
        this.input = $('#image-upload')[0];
        this.croppie11 = $('#croppie-1x1');
        this.croppie21 = $('#croppie-2x1');
        this.croppie31 = $('#croppie-3x1');
        this.croppie31b = $('#croppie-3x1b');
        this.croppie32 = $('#croppie-3x2');
        this.croppie32b = $('#croppie-3x2b');
        this.croppie32c = $('#croppie-3x2c');
        this.croppieOrig = $('#croppie-orig');
        this.croppieArb = $('#croppie-arb');
        this.filenameInput = $('#filename')[0];
        if(editor.retrieveLocalData()){
            $('#image-preview').attr('src', editor.image);
            $('#filename').val(editor.filename);
            this.initializeCroppie();
            this.loadWorkspace();
            $('#original-size-display').html('Current Image Details: <br/><strong>Width: ' + editor.imageWidth + 'px<br/>Height: ' + editor.imageHeight + 'px<br/>File Size: ' + (editor.originalSize/1024/1024).toFixed(2) + ' megabytes</strong>');
            if(editor.intrinsicSize && editor.intrinsicSize != editor.originalSize){
                $('#original-size-display').append('<div class="rvt-m-top-md rvt-alert rvt-alert--warning rvt-m-bottom-md" role="alertdialog" aria-labelledby="warning-alert-title">\
                <h1 class="rvt-alert__title" id="warning-alert-title">File was resized</h1>\
                <p class="rvt-alert__message">Your original file has been automatically resized to <strong>' + (editor.originalSize/1024/1024).toFixed(2) + ' megabytes (' + (((editor.originalSize/1024/1024).toFixed(2)/(editor.intrinsicSize/1024/1024).toFixed(2)*100)).toFixed(2) + '% of its original size)</strong>.<br/><br/>Original File Details:<br/>\
                <strong>Width: ' + editor.intrinsicWidth + 'px<br/>Height: ' + editor.intrinsicHeight + 'px<br/>File Size: ' + (editor.intrinsicSize/1024/1024).toFixed(2) + ' megabytes</strong></p>\
                <button type="button" class="rvt-alert__dismiss" data-alert-close>\
                    <span class="v-hide">Dismiss this alert</span>\
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\
                        <path fill="currentColor" d="M9.41,8l5.29-5.29a1,1,0,0,0-1.41-1.41L8,6.59,2.71,1.29A1,1,0,0,0,1.29,2.71L6.59,8,1.29,13.29a1,1,0,1,0,1.41,1.41L8,9.41l5.29,5.29a1,1,0,0,0,1.41-1.41Z"/>\
                    </svg>\
                </button>\
            </div>');

            }
        }
        this.addListeners();
    },

    storeImage: function(source, name, width, height, size) {
        if(localStorage){
            localStorage.setItem('image', source);
            localStorage.setItem('image-name', name);
            localStorage.setItem('image-width', width);
            localStorage.setItem('image-height', height);
            localStorage.setItem('image-size', size);
            localStorage.setItem('intrinsic-width', editor.intrinsicWidth);
            localStorage.setItem('intrinsic-height', editor.intrinsicHeight);
            localStorage.setItem('intrinsic-size', editor.intrinsicSize);
        }
    },

    storeImageName: function(name) {
        if(localStorage){
            localStorage.setItem('image-name', name);
        }
    },

    storeIntrinsicData: function(width, height, size) {
        if(localStorage){
            localStorage.setItem('intrinsic-width', width);
            localStorage.setItem('intrinsic-height', height);
            localStorage.setItem('intrinsic-size', size);
        }
    },

    storeCustomSizes: function() {
        if(localStorage){
            localStorage.setItem('custom-width', editor.customWidth);
            localStorage.setItem('custom-height', editor.customHeight);
        }
    },

    retrieveLocalData: function() {
        var success = true;
        if(localStorage && localStorage.getItem('image') != null){
            editor.image = localStorage.getItem('image');
            editor.filename = localStorage.getItem('image-name');
            editor.imageWidth = localStorage.getItem('image-width');
            editor.imageHeight = localStorage.getItem('image-height');
            editor.originalSize = localStorage.getItem('image-size');
            editor.intrinsicWidth = localStorage.getItem('intrinsic-width');
            editor.intrinsicHeight = localStorage.getItem('intrinsic-height');
            editor.intrinsicSize = localStorage.getItem('intrinsic-size');

            editor.createCroppie('croppie-23', false, $('#croppie-2x3-container'), 512,768, '');
            editor.createCroppie('croppie-43', false, $('#croppie-4x3-container'), 1024,768, '');
            editor.createCroppie('insta-11', false, $('#croppie-insta-1x1-container'), 1080,1080, 'insta-profile');
            editor.createCroppie('insta-191x1', false, $('#croppie-insta-191x1-container'), 1080,608, 'insta-landscape');
            editor.createCroppie('insta-45', false, $('#croppie-insta-4x5-container'), 1080,1350, 'insta-portrait');
            editor.createCroppie('insta-916', false, $('#croppie-insta-9x16-container'), 1080,1920, 'insta-story');
            editor.createCroppie('twitter-31', false, $('#croppie-twitter-3x1-container'), 1500,500, 'twitter-header');
            editor.createCroppie('twitter-11', false, $('#croppie-twitter-1x1-container'), 400,400, 'twitter-profile');
            editor.createCroppie('youtube-169', false, $('#croppie-youtube-16x9-container'), 2560,1440, 'yt-channel-art');
            editor.createCroppie('youtube-11', false, $('#croppie-youtube-1x1-container'), 800,800, 'yt-widescreen-thumb');
            editor.createCroppie('youtube-1692', false, $('#croppie-youtube-16x9-2-container'), 1280,720, 'yt-channel-banner');
            editor.createCroppie('youtube-265149', false, $('#croppie-youtube-265149-container'), 2120,1192, 'yt-channel-icon');
            editor.createCroppie('facebook-11', false, $('#croppie-facebook-1x1-container'), 180,180, 'fb-profile');
            editor.createCroppie('facebook-20578', false, $('#croppie-facebook-205x78-container'), 820,312, 'fb-banner');
            editor.createCroppie('facebook-1200-630', false, $('#croppie-facebook-1200-630-container'), 1200,630, 'fb-post');
            editor.createCroppie('facebook-169', false, $('#croppie-facebook-16x9-container'), 1920,1080, 'fb-event-page-banner');
        } else { 
            success = false; 
        }
        if(success && localStorage.getItem('custom-width') != null){
            editor.customWidth = localStorage.getItem('custom-width');
            editor.customHeight = localStorage.getItem('custom-height');
            $('#custom-width-input').val(editor.customWidth);
            $('#custom-height-input').val(editor.customHeight);
            $('#standard-arb').parent().find('h3 button span, div h3').html('Custom Size (' + editor.customWidth + 'x' + editor.customHeight + ')');

            editor.createCroppie('arb', false, $('#croppie-arb-container'), editor.customWidth, editor.customHeight);
        }
        return success;
    },

    addListeners: function () {
        console.log('Adding listeners...');
        var instance = this;
        $(this.input).on('change', instance.readFile); 
        $(this.filenameInput).on('keyup', function(e){
            name = $(e.target).val().toLowerCase().replace(' ', '_');
            editor.filename = name;
            editor.storeImageName(name);
        });
        $('#submit-custom').on('click keyup', function(e){
            if(e.keyCode && e.keyCode != 13){
                return;
            }
            editor.customWidth = $('#custom-width-input').val();
            editor.customHeight = $('#custom-height-input').val();

            editor.storeCustomSizes();


            var containerWidth = 600;
            var containerHeight = 400;

            var viewPortHeight = 0;
            var viewPortWidth = 0;

            if(editor.customWidth < editor.customHeight){
                viewPortHeight = 390;
                viewPortWidth = 390 * editor.customWidth / editor.customHeight;
            } else if (editor.customWidth > editor.customHeight) {
                viewPortWidth = 590;
                viewPortHeight = 590 * editor.customHeight / editor.customWidth;
            } else {
                viewPortWidth = 390;
                viewPortHeight = 390;
            }

            $('#standard-arb').parent().find('h3 button span, div h3').html('Custom Size (' + editor.customWidth + 'x' + editor.customHeight + ')');

            var settings = {
                enableZoom: true,
                enforceBoundary: false,
                mouseWheelZoom: true,
                showZoomer: true,
                backgroundColor: 'white',
                viewport: {
                    width:viewPortWidth,
                    height:viewPortHeight,
                    type: 'square'
                }
            }

            editor.createCroppie('arb', settings, $('#croppie-arb-container'), editor.customWidth, editor.customHeight);

        });
    },

    createCroppie(name, settings, $container, width, height, slug){

        if(!settings){
            settings = {
                enableZoom: true,
                enforceBoundary: false,
                mouseWheelZoom: true,
                showZoomer: true,
                backgroundColor: 'white',
                viewport: {
                    type: 'square'
                }
            }
        }
        if(settings.viewport.height == null || settings.viewport.width == null){
            max = Math.max(height, width);
            if(max == height){
                // portrait
                settings.viewport.height = 400-20;
                settings.viewport.width = settings.viewport.height / height * width;
                if(settings.viewport.width > 580){
                    settings.viewport.width = 600-20;
                    settings.viewport.height = settings.viewport.width / width * height;
                }
            } else {
                // landscape
                settings.viewport.width = 600-20;
                settings.viewport.height = settings.viewport.width / width * height;
                if(settings.viewport.height > 380){
                    settings.viewport.height = 400-20;
                    settings.viewport.width = settings.viewport.height / height * width;
                }
            }
        }

        $container.html('');
        var originalName = name;
        $('.croppie-cleanup-' + originalName).remove();
        name = name + editor.croppies.length + Date.now();
        $('#croppie-base-container #croppie-' + name).remove();
        $('#croppie-base-container').append('<div class="croppie-base croppie-cleanup-' + originalName + '" id="croppie-' + name + '" style="margin-bottom:40px; width:600px; height:400px;" ></div>')
        editor.croppies[name] = $('#croppie-' + name);
        editor.croppies[name].croppie(settings);

        editor.croppies[name].croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppies[name].croppie('setZoom', 1);
            editor.croppies[name].appendTo($container);
        });

        var btn = document.createElement('button');
        btn.innerHTML = 'Download ' + width + 'x' + height + ' Image';
        btn.id = 'download-button-'+name;
        btn.setAttribute('data-min-width', width);
        btn.setAttribute('data-min-height', height);
        $(btn).addClass('rvt-button rvt-m-top-sm croppie-cleanup-' +originalName);
        
        $container.parent().append(btn);
        $(document).on('click', '#download-button-'+name, function(){
            editor.download(width, height, editor.croppies[name], slug);
        });

    },

    warn: function(width, height){
        $('.rvt-button warning').removeClass('warning').removeClass('rvt-button--danger').attr('title', '');
        $('.rvt-button').each(function(){
            if(parseInt($(this).data('min-width')) > width){
                $(this).addClass('rvt-button--danger').addClass('warning').attr('title', 'The supplied image does not meet the minimum width required for this download. The downloaded file will be scaled to the required size and some loss of image quality will occur. ')
            }
            if(parseInt($(this).data('min-height')) > height){
                $(this).addClass('rvt-button--danger').addClass('warning').attr('title', $(this).attr('title') + 'The supplied image does not meet the minimum height required for this download. The downloaded file will be scaled to the required size and some loss of image quality will occur.')
            }
        });
    },

    loadWorkspace: function() {
        image = new Image();
        image.src = editor.image;

        editor.originalWidth = image.naturalWidth;
        editor.originalHeight = image.naturalHeight;

        editor.warn(editor.originalWidth, editor.originalHeight);

        $('#standard-orig').parent().find('h3 button span, div h3').html('Original Size (' + editor.originalWidth + 'x' + editor.originalHeight + ')');
        $('#standard-orig [data-min-width]').attr('data-min-width', editor.originalWidth);
        $('#standard-orig [data-min-height]').attr('data-min-height', editor.originalHeight);
        $('.croppie-base').addClass('ready');

        editor.createCroppie('orig', false, $('#croppie-orig-container'), editor.originalWidth, editor.originalHeight);

        editor.croppie11.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie11.croppie('setZoom', .4);
            editor.croppie11.appendTo($('#croppie-1x1-container'));
        });

        editor.croppie21.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie21.croppie('setZoom', .4);
            editor.croppie21.appendTo($('#croppie-2x1-container'));
        });

        editor.croppie31.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie31.croppie('setZoom', .4);
            editor.croppie31.appendTo($('#croppie-3x1-container'));
        });

        editor.croppie31b.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie31b.croppie('setZoom', .4);
            editor.croppie31b.appendTo($('#croppie-3x1-container-b'));
        });
        
        editor.croppie32.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie32.croppie('setZoom', .4);
            editor.croppie32.appendTo($('#croppie-3x2-container'));
        });

        editor.croppie32b.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie32b.croppie('setZoom', .4);
            editor.croppie32b.appendTo($('#croppie-3x2-container-b'));
        });

        editor.croppie32c.croppie('bind', {
            url: editor.image
        }).then(function () {
            editor.croppie32c.croppie('setZoom', .4);
            editor.croppie32c.appendTo($('#croppie-3x2-container-c'));
        });

        if(editor.customWidth && editor.customHeight){
            $('#custom-width-input').val(editor.customWidth);
            $('#custom-height-input').val(editor.customHeight);
        }

        editor.warn(editor.originalWidth, editor.originalHeight);
    },

    shrinkFile: function(file, name, width, height) {
        // file must be type Image

        if(width > 3072){
            height = height / width * 3072;
            width = 3072;
        }
        if(height > 3072){
            width = width / height * 3072;
            height = 3072;
        }
        console.log('File will be shrunk to width and height:',width,height);
        var options = {
            quality: editor.quality,
            maxWidth:width,
            maxHeight:height,
            success: function(photo){

                var reader = new FileReader();
                reader.onload = function (e) {
                    var image = new Image();

                    image.src = e.target.result;
                    image.onload = function(){
                        console.log("Shrunk size: ", (new TextEncoder().encode(image.src)).length);
                        try{
                            editor.storeImage(image.src, name, image.naturalWidth, image.naturalHeight, (new TextEncoder().encode(image.src)).length);
                            window.location.reload();
                        } catch ($exception) {
                            if(editor.quality <= .05){
                                alert('Unknown error. Please try again with a different image.');
                                window.location.reload();
                            }
                            editor.quality -= .05;
                            console.log("Quality set to: " + editor.quality);
                            editor.shrinkFile(file, name, image.naturalWidth, image.naturalHeight);
                        }   
                    }
                }
                reader.readAsDataURL(photo);
            }
        };
        
        var c = new Compressor(file, options);
    },

    readFile: function () {
        var input = editor.input;
        $('.workspace').show().attr('aria-hidden', 'false');
        if (input.files && input.files[0]) {
            var name = input.files[0].name.split('.')[0];
            var fileSize = input.files[0].size;
            var fileSizeKb = fileSize/1024;
            var fileSizeMb = fileSizeKb/1024;
            console.log('FileSize: ', fileSize, fileSizeKb + ' kb', fileSizeMb + ' mb');

            name = name.toLowerCase().replace(' ', '_');
            editor.filename = name;
            $(editor.filenameInput).val(name);
            var reader = new FileReader();

            reader.onload = function (e) {
                var image = new Image();

                image.src = e.target.result;
                image.onload = function(){
                    editor.intrinsicWidth = image.naturalWidth;
                    editor.intrinsicHeight = image.naturalHeight;
                    editor.intrinsicSize = fileSize;
                    if(fileSizeMb > 4){
                        console.log('File size (' + fileSizeMb.toFixed(2) +' megabytes) is larger than the limit (4.5 megabytes); attempting to reduce its size');
                        editor.shrinkFile(input.files[0], name, image.naturalWidth, image.naturalHeight);
                    } else {
                        editor.storeIntrinsicData(null, null, null);
                        editor.storeImage(image.src, name, image.naturalWidth, image.naturalHeight, fileSize);
                        window.location.reload();
                    }
                }
                
            }

            reader.readAsDataURL(input.files[0]);
        } else {
            alert("Sorry - your browser doesn't support the FileReader API");
        }
    },

    initializeCroppie: function() {
        console.log('Initializing Croppie plugin...');

        editor.croppie11.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:540,
                type: 'square'
            }
        });

        editor.croppie21.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:270,
                type: 'square'
            }
        });
        
        editor.croppie31.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:182,
                type: 'square'
            }
        });
        
        editor.croppie31b.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:182,
                type: 'square'
            }
        });
        
        editor.croppie32.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:364,
                type: 'square'
            }
        });

        editor.croppie32b.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:364,
                type: 'square'
            }
        });

        editor.croppie32c.croppie({
            enableZoom: true,
            enforceBoundary: false,
            mouseWheelZoom: true,
            showZoomer: true,
            backgroundColor: 'white',
            viewport: {
                width:540,
                height:364,
                type: 'square'
            }
        });

    },

    save: function(filename, data) {
        var blob = new Blob([data], {type: 'image/jpg'});
        if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        }
        else{
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;        
            document.body.appendChild(elem);
            elem.click();        
            document.body.removeChild(elem);
        }
    },

    download: function(width, height, croppie, slug){
        if(slug === null){
            slug = '';
        }
        editor.filename = $(editor.filenameInput).val();
        croppie.croppie('result', {
            type: 'blob',
            size: {
                width: width,
                height: height
            },
            format: 'jpeg'
        }).then(function(blob){
            editor.deliver(blob, {quality: .95,width:width,height:height}, slug);
        });
    },

    deliver: function(image, options, slug){
        if(slug === null){
            slug = '';
        }
        options.success = function(photo){
            editor.save(editor.filename + '-' + (slug ? slug + '-' : '') + options.width + 'x' + options.height + '.jpg', photo);
        }
        var c = new Compressor(image, options);
    }
};

$(document).ready(function(){
    window.editor.init($('#image-upload'));
});